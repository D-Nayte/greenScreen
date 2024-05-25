# Chnage GPIO on boot

gpio=X: Bezieht sich auf den GPIO-Pin mit der Nummer X.
op: Steht für "Output", was bedeutet, dass der GPIO-Pin als Ausgang konfiguriert ist.
dl: Steht für "Drive Low", was bedeutet, dass der GPIO-Pin im Ausgangszustand auf LOW (0V) gesetzt ist.

```bash
sudo nano /boot/firmware/config.txt
```

# Test i2c bus

sudo i2cdetect -y 1

# Set GPIO 4 (BCM) as an output and set it to low

Add the following line to the end of the file:

```bash
gpio=4=op,dl
```

- press Ctrl+O to save the file , Enter to confirm the file name and Ctrl+X to exit the editor.

<!-- if needed -->

gpio=4=op,dl
gpio=17=op,dl
gpio=27=op,dl
gpio=22=op,dl
gpio=5=op,dl
gpio=6=op,dl
gpio=13=op,dl
gpio=19=op,dl
gpio=14=op,dl
gpio=15=op,dl
gpio=18=op,dl
gpio=23=op,dl
gpio=24=op,dl
gpio=25=op,dl
gpio=12=op,dl
gpio=16=op,dl
gpio=20=op,dl
gpio=21=op,dl
