# Chnage GPIO on boot

```bash
sudo nano /boot/firmware/config.txt
```

# Set GPIO 4 (BCM) as an output and set it to low

Add the following line to the end of the file:

```bash
gpio=4=op,dl
```

- press Ctrl+O to save the file , Enter to confirm the file name and Ctrl+X to exit the editor.
