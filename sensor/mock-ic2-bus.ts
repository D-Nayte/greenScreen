import { EnvSensorData } from '../types/sensor';

export class MockI2CBus {
  constructor() {}
  async init() {
    console.log('Mocking I2C Bus - RUNN');
  }

  async readSensorData(): Promise<EnvSensorData> {
    return {
      temperature_C: 20.0,
      humidity: 50.0,
      pressure_hPa: 1013.25,
    };
  }
  // Mock-Funktionen hier hinzufügen
}
