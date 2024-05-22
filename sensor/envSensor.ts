// @ts-nocheck

import { Data } from '../types/sensor';

let BME280;

if (process.platform === 'linux') {
  const { default: BME280Class } = await import('bme280-sensor');
  BME280 = BME280Class;
} else {
  const { MockI2CBus } = await import('./mock-ic2-bus');
  BME280 = MockI2CBus;
}

// Konfiguration für den Sensor
const options = {
  i2cBusNo: 1, // Abhängig von deinem Raspberry Pi Modell (meistens 1 für Raspberry Pi 2 und 3)
  i2cAddress: 0x76, // Standard I2C Adresse für den BME280-Sensor
};

const bme280 = new BME280(options);

export type EnvData =
  | {
      temperature: number;
      humidity: number;
      pressure: number;
    }
  | undefined;

export const readEnvSensor = async (): Promise<EnvData> => {
  try {
    const dataRaw = await bme280.readSensorData();
    const data = {
      temperature: parseFloat(dataRaw?.temperature_C.toFixed(2)),
      humidity: parseFloat(dataRaw?.humidity.toFixed(2)),
      pressure: parseFloat(dataRaw?.pressure_hPa.toFixed(2)),
    };
    return data;
  } catch (error) {
    console.error(`BME280 read error: ${error}`);
  }
};

export const handleEnvChange = async ({ generall }: Data, shouldWriteData: { change: boolean }) => {
  const envData = await readEnvSensor();

  if (!envData) throw new Error("Couldn't read env data sesnor");
  generall.temperature.current = envData.temperature;
  generall.humidityAir.current = envData.humidity;
  generall.pressure.current = envData.pressure;

  console.log('envData :>> ', envData);

  const tempAboveMax = envData.temperature > generall.temperature.max;
  const tempBelowMin = envData.temperature < generall.temperature.min;
  const tempInRange =
    envData.temperature >= generall.temperature.min &&
    envData.temperature <= generall.temperature.max;
  const fanisOff = generall.fan.current === 0;

  console.log('tempInRange :>> ', tempInRange);

  if (!tempInRange && generall.fan.active) {
    console.log('!fanisOff :>> ', !fanisOff);
    const fanShouldBeActive = tempAboveMax && fanisOff;
    const fanShouldBeInactive = tempBelowMin && !fanisOff;

    console.log('fanShouldBeActive :>> ', fanShouldBeActive);
    console.log('fanShouldBeInactive :>> ', fanShouldBeInactive);

    if (fanShouldBeActive || fanShouldBeInactive) {
      shouldWriteData.change = true;
      generall.fan.current = fanShouldBeActive ? 1 : 0;
    }
  }
};

try {
  await bme280.init();
} catch (error) {
  console.error('Error Reading Enviroment Sensor', error);
}
