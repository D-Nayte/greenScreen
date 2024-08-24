import { exec } from 'child_process'
import { writeErrorLogFile } from '../logs/writeLogs.js'
import { Data } from '../types/sensor.js'

export type EnvData =
    | {
          temperature: number
          humidity: number
      }
    | undefined

const isLinux = process.platform === 'linux'

export const readEnvSensor = async (): Promise<EnvData> => {
    return new Promise((resolve, reject) => {
        if (!isLinux) resolve({ temperature: 20, humidity: 50 })

        exec(
            './pythonVirtual/bin/python3 sensor/env.py',
            (error, stdout, stderr) => {
                if (error) {
                    console.error(
                        `Fehler beim lesen des Env sensors: ${stderr}`
                    )
                    writeErrorLogFile(
                        `Fehler beim lesen des Env sensors: ${stderr}`
                    )
                    reject()
                }

                const data = JSON.parse(stdout)
                const formatted = {
                    temperature: parseFloat(data?.temperature.toFixed(2)),
                    humidity: parseFloat(data?.humidity.toFixed(2)),
                }

                resolve(formatted)
            }
        )
    })
}

export const handleEnvChange = async (
    { generall }: Data,
    shouldWriteData: { change: boolean }
) => {
    const envData = await readEnvSensor()

    if (!envData) throw new Error("Couldn't read env data sesnor")
    generall.temperature.current = envData.temperature
    generall.humidityAir.current = envData.humidity

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
