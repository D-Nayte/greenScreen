import { EnvSensorData } from '../types/sensor'

export class MockBME280 {
    constructor() {}
    async init() {
        console.info('Mocking MockBME280')
    }

    async readSensorData(): Promise<EnvSensorData> {
        return {
            temperature_C: Math.random() * 10 + 20,
            humidity: Math.random() * 20 + 50,
            pressure_hPa: 1013.25,
        }
    }
}
