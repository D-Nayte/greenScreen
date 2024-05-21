import gpio from 'rpi-gpio';

// Definiere den Pin, den du steuern möchtest
const pin = 7;

// Öffne den GPIO-Pin im Ausgangsmodus
gpio.setup(pin, gpio.DIR_OUT, (err) => {
  if (err) {
    console.error('Error beim Öffnen des Pins:', err);
    return;
  }

  // Schalte den Pin ein
  gpio.write(pin, true, (err) => {
    if (err) {
      console.error('Error beim Schreiben auf den Pin:', err);
      return;
    }
    console.log('Pin wurde eingeschaltet');
  });

  // Schalte den Pin nach 3 Sekunden wieder aus
  setTimeout(() => {
    gpio.write(pin, false, (err) => {
      if (err) {
        console.error('Error beim Schreiben auf den Pin:', err);
        return;
      }
      console.log('Pin wurde ausgeschaltet');
    });
  }, 3000);
});

export const a = 'test';
