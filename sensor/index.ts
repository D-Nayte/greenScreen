// @ts-nocheck

import BME280 from "bme280-sensor";

// Konfiguration für den Sensor
const options = {
  i2cBusNo: 1, // Abhängig von deinem Raspberry Pi Modell (meistens 1 für Raspberry Pi 2 und 3)
  i2cAddress: 0x76, // Standard I2C Adresse für den BME280-Sensor
};

const bme280 = new BME280(options);

export const readEnvSensor = async (): Promise<EnvSensorData | undefined> => {
  try {
    const data = await bme280.readSensorData();
    return data;
  } catch (error) {
    console.log(`BME280 read error: ${error}`);
  }
};

try {
  await bme280.init();
} catch (error) {
  console.error("Error Reading Enviroment Sensor", error);
}
