import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
import sys
import argparse
import json
import builtins

# Override the default print function to always use flush=True
original_print = builtins.print

def print(*args, **kwargs):
    kwargs.setdefault('flush', True)
    original_print(*args, **kwargs)
    # sys.stdout.flush()


args = sys.argv
calibrationTime30Seconds = 30
timeToStart=10
h_0_min_cal = 0
h_100_max_cal = 0
parser = argparse.ArgumentParser()

# Create the I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Create the ADC object using the I2C bus
ads = ADS.ADS1115(i2c, address=0x48)

# Create single-ended input on channel 0
chan = AnalogIn(ads, ADS.P0)

def calibrateLow(chan):
    global h_0_min_cal
    calTime = calibrationTime30Seconds
    h_0_min = []
    while calTime > 0:
        h_0_min.append(chan.value)
        time.sleep(1)
        calTime -= 1
        print(f"Average: {sum(h_0_min)/len(h_0_min)}")
    h_0_min_cal = sum(h_0_min) / len(h_0_min)

def calibrateHigh(chan):
    global h_100_max_cal
    calTime = calibrationTime30Seconds
    h_0_max = []
    while calTime > 0:
        h_0_max.append(chan.value)
        time.sleep(1)
        calTime -= 1
        print(f"Average: {sum(h_0_max)/len(h_0_max)}")
    h_100_max_cal = sum(h_0_max) / len(h_0_max)

def calibrate(address, channel):
    print("address",address)
    print("channel",channel)
    global timeToStart
    start = timeToStart
    ads = ADS.ADS1115(i2c, address=int(address, 16))
    chan = AnalogIn(ads, getattr(ADS, channel))
   
    print("Calibrating low")
    while start > 0:
        print(f"Starting in {start} seconds, dry your Sensor")
        time.sleep(1)
        start -= 1
    print("Calibrating low")
    calibrateLow(chan)

    start = timeToStart

    print("Calibration high")
    while start > 0:
        print(f"Starting in {start} seconds, put your sensor in water")
        time.sleep(1)
        start -= 1
    print("Calibrating high, put your sensor in water")
    calibrateHigh(chan)
    print(f"Calibration Data: {{\"h_0_min_cal\": {h_0_min_cal}, \"h_100_max_cal\": {h_100_max_cal}}}")
    sys.exit(0)

if len(args) > 1:
    if "--calibrate" in args:
        parser.add_argument("-addr")
        parser.add_argument("-chan")
        parser.add_argument("--calibrate", help="calibrate the sensor", action="store_true")
        args = parser.parse_args()
        address = args.addr
        channel = args.chan
        calibrate(address, channel)

# Main sensor reading loop
file = open("data/config.json")
config = json.loads(file.read())
activeSensor = []
adcsensors = config['sensors']['adcSensors']
plantsConfig = config['plantConfig']

for plant in plantsConfig:
    isActive = plant["usehumiditySoil"]
    sensor = plant["soilSensor"]
   

    if isActive:
        h_0_min = adcsensors[sensor]["h_0_min"]
        h_100_max = adcsensors[sensor]["h_100_max"]

        if h_0_min == 0 or h_100_max == 0:
            raise ValueError(f"Calibrate the Sensor {sensor} first!")

        sensor = {
            "address": adcsensors[sensor]["address"],
            "channel": adcsensors[sensor]["channel"],
            "h_0_min": adcsensors[sensor]["h_0_min"],
            "h_100_max": adcsensors[sensor]["h_100_max"],
            "label": sensor
        }
        activeSensor.append(sensor)

# while True:
sensorData = []
for sensor in activeSensor:
    ads = ADS.ADS1115(i2c, address=int(sensor["address"], 16))
    chan = AnalogIn(ads, getattr(ADS, sensor["channel"]))
    h_0_min_cal = sensor["h_0_min"]
    h_100_max_cal = sensor["h_100_max"]
    hum = 100 - (100 / (h_0_min_cal - h_100_max_cal) * (chan.value - h_100_max_cal))
    rounded_hum = round(hum, 1)
    sensorData.append({"sensor": sensor["label"], "humidity": rounded_hum})
print(sensorData)

