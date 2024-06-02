import { exec } from 'child_process'
import { Data, PinKey } from '../types/sensor'
import { pinList } from '../utils/constant'

const isLinux = process.platform === 'linux'

isLinux &&
    exec('pgrep pigpiod', (error, stdout, stderr) => {
        if (stdout) {
            console.info('pigpiod läuft bereits')
        } else {
            console.info('pigpiod läuft nicht')

            exec('sudo pigpiod', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Fehler beim Starten von pigpiod: ${stderr}`)
                    return
                }
                console.info('pigpiod gestartet')
            })
        }
    })

export const enableRelaiPower = async () => {
    if (!isLinux) return console.log('not on linux, mocking relai on')
    const pin = 26

    runCommand(`pigs w ${pin} 0`, () => {
        console.info(`GPIO wurde ausgeschaltet, Relai ist on `)
    })
}

export const disableRelaiPower = async () => {
    if (!isLinux) return console.log('not on linux, mocking relai off')
    const pin = 26

    runCommand(`pigs w ${pin} 1`, () => {
        console.info(`GPIO wurde einsgeschaltet, Relai ist off`)
    })
}

export const checkGpioStatus = (pinKey: PinKey) => {
    const pin = pinList[pinKey]
    const command = `pigs r ${pin}`
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                // console.error(`Fehler beim Abfragen des GPIO-Status: ${stderr}`);
                resolve(null)
            } else {
                // 0 bedeutet LOW, 1 bedeutet HIGH
                const status = parseInt(stdout.trim(), 10) === 1

                resolve(status)
            }
        })
    })
}

// Funktion zum Ausführen von Shell-Befehlen
const runCommand = (command: string, callback: (stdout: string) => void) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Fehler beim Ausführen des Befehls: ${stderr}`)
            return
        }
        if (callback) callback(stdout)
    })
}

export const enableGpio = async (pinKey: PinKey) => {
    if (!isLinux)
        return console.log(`nicht auf linux, mocking ${pinKey} eingeschaltet`)

    const isEnabled = await checkGpioStatus(pinKey)
    if (isEnabled) return console.log(`${pinKey} ist bereits eingeschaltet`)
    if (isEnabled === null) return console.log(`${pinKey} nicht angeschlossen!`)

    const pin = pinList[pinKey]
    runCommand(`pigs w ${pin} 1`, () => {
        console.log(`${pinKey} wurde eingeschaltet`)
    })
}

export const disableGpio = async (pinKey: PinKey) => {
    if (!isLinux)
        return console.log(`nicht auf linux, mocking ${pinKey} ausgeschaltet`)

    const pin = pinList[pinKey]
    const isEnabled = await checkGpioStatus(pinKey)
    if (isEnabled === false)
        return console.log(`${pinKey} ist bereits ausgeschaltet`)
    if (isEnabled === null) return console.log(`${pin} nicht angeschlossen!`)

    runCommand(`pigs w ${pin} 0`, () => {
        console.log(`${pinKey} wurde ausgeschaltet`)
    })
}

export const handleRelaiChanges = (configData: Data) => {
    //  activate fan
    const fan = configData.generall.fan
    fan.current && fan.active
        ? enableGpio(fan.sensor!)
        : disableGpio(fan.sensor!)

    const plantsDisabledPump = configData.plantConfig.filter(
        (plant) => !plant.usePump && plant.pumpSensor
    )
    plantsDisabledPump.forEach((plant) => {
        const sensorLabel = plant.pumpSensor

        sensorLabel && disableGpio(sensorLabel)
    })

    //  activate plant pumps
    const plants = configData.plantConfig.filter(
        (plant) => plant.usePump && plant.pumpSensor
    )

    plants.forEach((plant) => {
        const sensorLabel = plant.pumpSensor!

        const senroKey = pinList[sensorLabel]
        plant.waterOn ? enableGpio(sensorLabel) : disableGpio(sensorLabel)
    })
}
