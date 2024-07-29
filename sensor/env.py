import time
import board
import busio
from adafruit_htu21d import HTU21D
import json

ds = u'\xb0' # degree sign
i2c = busio.I2C(board.SCL, board.SDA)
sensor = HTU21D(i2c)


temp = sensor.temperature
humidity = sensor.relative_humidity
# print('Temperature: {:.1f}{}C'.format(temp, ds))
# print('Humidity: {:.1f}%\n'.format(humidity))

data = {
    "temperature": temp,
    "humidity": humidity
}

# print("TEST!",data)

dataJson = json.dumps(data)

print(dataJson)
 

# import time
# import board
# import busio
# from adafruit_htu21d import HTU21D
# ds = u'\xb0' # degree sign
# i2c = busio.I2C(board.SCL, board.SDA)
# sensor = HTU21D(i2c)
# print('Press CTRL + C to end the script!')
# try:
#     while True:
#         temp = sensor.temperature
#         humidity = sensor.relative_humidity
#         print('Temperature: {:.1f}{}C'.format(temp, ds))
#         print('Humidity: {:.1f}%\n'.format(humidity))
#         time.sleep(1)
# except KeyboardInterrupt:
#     print('\nScript end!')
