<!-- Test a GPIO -->

npm run testGPIO -- enable A/2

install python apckages

<!-- example ADS11115 ADC -->

pythonVirtual/bin/pip3 install --use-pep517 adafruit-circuitpython-lis3dh

<!-- activate virtual python -->

source pythonVirtual/bin/activate

<!-- calibrate a sensor -->

pythonVirtual/bin/python3 sensor/adc.py --calibrate -addr 0x48 -chan P0

<!-- automatik project start on bbot up -->

<!-- run npm in background -->

(npm run start&)

<!-- AUTO START -->

edit file: sudo nano /etc/rc.local

test file: sudo /etc/rc.local

make it start: sudo systemctl start rc-local.service

restart: sudo systemctl restart rc-local.service

test status: sudo systemctl status rc-local.service

<!-- GPIO pigpiod -->

Install pigpio
If you're working with the rpi3's gpio, the pigpio library can be very handy.

sudo apt-get update
sudo apt-get install pigpio
If you also want to access pigpio from python, install: sudo apt-get install python-pigpio python3-pigpio

# Edit port on pigpoid

## Erstelle das Verzeichnis, falls es nicht existiert:

sudo mkdir -p /etc/systemd/system/pigpiod.service.d/

## Erstelle oder bearbeite die Override-Datei:

sudo nano /etc/systemd/system/pigpiod.service.d/override.conf
Füge die folgenden Zeilen hinzu:

`[Unit]
 Description=Daemon required to control GPIO pins via pigpio
 [Service]
 ExecStart=/usr/bin/pigpiod -l -p 7777
 ExecStop=/bin/systemctl kill pigpiod
 Type=forking
 [Install]
 WantedBy=multi-user.target`

Setup pigpiod service to run at boot
sudo systemctl enable pigpiod
You can also start pigpiod immediately by doing: sudo systemctl start pigpiod

After reboot, verify with: sudo service pigpiod status
