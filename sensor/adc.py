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
temp = None

# Create the I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

def map_value(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

def get_soil_moisture(raw_value, DRY_VALUE, WET_VALUE, current_temp, cal_temp):
    # Apply temperature compensation to the raw sensor value
    adjusted_value = apply_temp_compensation(raw_value, current_temp, cal_temp)

    # Map the adjusted value to a percentage
    moisture_percentage = map_value(adjusted_value, DRY_VALUE, WET_VALUE, 0, 100)
    # Clamp the values between 0 and 100
    moisture_percentage = max(0, min(100, moisture_percentage))
    rounded_hum = round(moisture_percentage, 1)
    return rounded_hum

def apply_temp_compensation(raw_value, current_temp, cal_temp):
    # Derive the correction factor based on provided data
    # Using the data points for temperature and raw sensor values:
    # Temp 23: min 19411.633333, max 117261.1
    # Temp 32: min 19628.06666, max 9539.033333

    # Calculate the slopes for min and max values
    slope_min = (19628.06666 - 19411.633333) / (32 - 23)
    slope_max = (9539.033333 - 117261.1) / (32 - 23)

    # Adjust the raw value using the slope and difference in temperature
    adjustment_min = slope_min * (current_temp - cal_temp)
    adjustment_max = slope_max * (current_temp - cal_temp)

    # Apply adjustment to the raw value
    adjusted_value = raw_value + adjustment_min if raw_value < (19411.633333 + 117261.1) / 2 else raw_value + adjustment_max

    return adjusted_value

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
    if "-temp" in args:
        parser.add_argument("-temp")
        temp = args.temp

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
            "label": sensor,
            "calTemp": adcsensors[sensor]["calTemp"]
        }
        activeSensor.append(sensor)

sensorData = []
for sensor in activeSensor:
    ads = ADS.ADS1115(i2c, address=int(sensor["address"], 16))
    chan = AnalogIn(ads, getattr(ADS, sensor["channel"]))
    h_0_min_cal = sensor["h_0_min"]
    h_100_max_cal = sensor["h_100_max"]
    calTemp = sensor["calTemp"]
    current_temp = float(temp) if temp is not None else calTemp  # Use current temp if provided, otherwise use calTemp
    humidity = get_soil_moisture(chan.value, h_0_min_cal, h_100_max_cal, current_temp, calTemp)
    sensorData.append({"sensor": sensor["label"], "humidity": humidity})

print("sensorData:", sensorData)
