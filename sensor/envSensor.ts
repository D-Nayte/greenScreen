// @ts-nocheck

import { Data } from '../types/sensor'

export type EnvData =
    | {
          temperature: number
          humidity: number
          pressure: number
      }
    | undefined

let BME280

if (process.platform === 'linux') {
    const { default: BME280Class } = await import('bme280-sensor')
    BME280 = BME280Class
} else {
    const { MockBME280 } = await import('./mockBME280')
    BME280 = MockBME280
}

// Konfiguration für den Sensor
const options = {
    i2cBusNo: 1, // Abhängig von deinem Raspberry Pi Modell (meistens 1 für Raspberry Pi 2 und 3)
    i2cAddress: 0x77, // Standard I2C Adresse für den BME280-Sensor
}

let bme280 = new BME280(options)
let hasError: boolean = false

export const initEnvSensor = async () => {
    try {
        await bme280.init()
        bme280 = bme280
    } catch (error) {
        console.error('Error Reading Enviroment Sensor', error)
        hasError = true
    }
}

export const readEnvSensor = async (): Promise<EnvData> => {
    if (hasError) console.error('Error during Init BME280 Sensor')
    try {
        const dataRaw = await bme280.readSensorData()
        const data = {
            temperature: parseFloat(dataRaw?.temperature_C.toFixed(2)),
            humidity: parseFloat(dataRaw?.humidity.toFixed(2)),
            pressure: parseFloat(dataRaw?.pressure_hPa.toFixed(2)),
        }
        return data
    } catch (error) {
        console.error(`BME280 read error: ${error}`)
    }
}

export const handleEnvChange = async (
    { generall }: Data,
    shouldWriteData: { change: boolean }
) => {
    const envData = await readEnvSensor()

    if (!envData) throw new Error("Couldn't read env data sesnor")
    generall.temperature.current = envData.temperature
    generall.humidityAir.current = envData.humidity
    generall.pressure.current = envData.pressure

    const tempAboveMax = envData.temperature > generall.temperature.max
    const tempBelowMin = envData.temperature < generall.temperature.min
    const tempInRange =
        envData.temperature >= generall.temperature.min &&
        envData.temperature <= generall.temperature.max
    const fanisOff = generall.fan.current === 0

    if (!tempInRange && generall.fan.active) {
        const fanShouldBeActive = tempAboveMax && fanisOff
        const fanShouldBeInactive = tempBelowMin && !fanisOff

        if (fanShouldBeActive || fanShouldBeInactive) {
            shouldWriteData.change = true
            generall.fan.current = fanShouldBeActive ? 1 : 0
        }
    }
}
