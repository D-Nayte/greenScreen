install python apckages

<!-- example ADS11115 ADC -->

pythonVirtual/bin/pip3 install --use-pep517 adafruit-circuitpython-lis3dh

<!-- activate virtual python -->

source pythonVirtual/bin/activate

<!-- calibrate a sensor -->

pythonVirtual/bin/python3 sensor/adc.py --calibrate -addr 0x48 -chan P0

<!-- automatik project start on bbot up -->

sudo nano /etc/rc.local
#!/bin/sh -e

#

# rc.local

#

# This script is executed at the end of each multiuser runlevel.

# Make sure that the script will "exit 0" on success or any other

# value on error.

#

# By default this script does nothing.

# Print the IP address

\_IP=$(hostname -I) || true
if [ "$\_IP" ]; then
printf "My IP address is %s\n" "$\_IP"
fi

cd /path/to/your/npm/project
npm start &

exit 0
