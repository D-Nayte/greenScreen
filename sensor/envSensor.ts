import { writeErrorLogFile } from '../logs/writeLogs'
import { Data } from '../types/sensor'
import { runCommand } from './gipo'

export type EnvData =
    | {
          temperature: number
          humidity: number
          pressure: number
      }
    | undefined

let BME280

if (process.platform === 'linux') {
    //@ts-ignore
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

export const powerEnvSensor = async (status: 'enable' | 'disable') => {
    const onOrOff = status === 'enable' ? 1 : 0
    return new Promise((resolve, reject) => {
        //switch gpio 19 to High to enbale power for the env sensor
        runCommand(`pigs w 19 ${onOrOff}`, (_, err) => {
            if (err) {
                reject(`Error enabling Relai: ${err}`)
            }
            resolve(`GPIO wurde ausgeschaltet, Relai ist on `)
            return
        })
    })
}

export const initEnvSensor = async () => {
    try {
        await powerEnvSensor('disable')
        await powerEnvSensor('enable')
        await bme280.init()
        bme280 = bme280
    } catch (error) {
        console.error('Error Initialising Enviroment Sensor', error)
        writeErrorLogFile(
            ` Error Initialising Enviroment Sensor: ${error} ` +
                new Date().toLocaleString()
        )

        hasError = true
    }
}

export const readEnvSensor = async (): Promise<EnvData> => {
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
        writeErrorLogFile(
            ` Error reading Enviroment Sensor: ${error} ` +
                new Date().toLocaleString()
        )

        if (hasError) {
            console.error('Trying to reinit the BME280 sensor...')
            hasError = false
        }
        await initEnvSensor()
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

    const fanIsActivated = generall.fan.active === true

    const tempInRange =
        envData.temperature >= generall.temperature.min &&
        envData.temperature <= generall.temperature.max

    const humidityInRange =
        envData.humidity >= generall.humidityAir.min &&
        envData.humidity <= generall.humidityAir.max

    const fanShouldBeACtive =
        (!tempInRange || !humidityInRange) && fanIsActivated ? true : false

    shouldWriteData.change = !!generall.fan.current !== fanShouldBeACtive
    generall.fan.current = fanShouldBeACtive ? 1 : 0
}
