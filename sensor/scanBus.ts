//ts-nocheck

import i2c from "i2c-bus";

// Die I2C-Busnummer kann je nach Raspberry Pi-Modell variieren. Normalerweise ist es 1.
export const scanBus = () => {
  const I2C_BUS_NUMBER = 1;
  const bus = i2c.openSync(I2C_BUS_NUMBER);

  // Gültige I2C-Adressen reichen von 0x03 bis 0x77.
  const START_ADDR = 0x03;
  const END_ADDR = 0x77;

  console.log("Scanning I2C bus...");

  for (let addr = START_ADDR; addr <= END_ADDR; addr++) {
    try {
      bus.readByteSync(addr, 0x00);
      console.log(`Device found at address 0x${addr.toString(16)}`);
    } catch (e: any) {
      // Ein Fehler wird erwartet, wenn kein Gerät an dieser Adresse vorhanden ist.
      if (e.code !== "ENODEV" && e.code !== "EIO") {
        console.error(`Error at address 0x${addr.toString(16)}:`, e.message);
      }
    }
  }

  bus.closeSync();
  console.log("Scan complete.");
};
