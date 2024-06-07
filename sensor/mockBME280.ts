import { EnvSensorData } from '../types/sensor'

const envData = {
    temperature_C: 30.0,
    humidity: 50.0,
    pressure_hPa: 1013.25,
}

export class MockBME280 {
    constructor() {}
    async init() {
        console.info('Mocking MockBME280')
    }

    async readSensorData(): Promise<EnvSensorData> {
        envData.temperature_C === 30 &&
            setTimeout(() => {
                envData.temperature_C = envData.temperature_C * 10
                envData.humidity = envData.humidity * 10
            }, 20000)

        return envData
    }
}
