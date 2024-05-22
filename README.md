install python apckages

<!-- example ADS11115 ADC -->

pythonVirtual/bin/pip3 install --use-pep517 adafruit-circuitpython-lis3dh

<!-- activate virtual python -->

source pythonVirtual/bin/activate

<!-- calibrate a sensor -->

pythonVirtual/bin/python3 sensor/adc.py --calibrate -addr 0x48 -chan P0
