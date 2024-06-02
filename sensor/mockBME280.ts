import { EnvSensorData } from '../types/sensor';

export class MockBME280 {
  constructor() {}
  async init() {
    console.info('Mocking MockBME280');
  }

  async readSensorData(): Promise<EnvSensorData> {
    return {
      temperature_C: 20.0,
      humidity: 50.0,
      pressure_hPa: 1013.25,
    };
  }
}
