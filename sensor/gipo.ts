import { exec } from 'child_process'
import { Data, PinKey } from '../types/sensor.js'
import { pinList } from '../utils/constant.js'

const isLinux = process.platform === 'linux'

export const enablePigpiod = async () => {
    return new Promise((resolve, reject) => {
        if (!isLinux)
            resolve(console.info('not on linux, skipping pigpiod check'))

        isLinux &&
            exec('pgrep pigpiod', (error, stdout, stderr) => {
                if (stdout) {
                    resolve(console.info('pigpiod läuft bereits'))
                } else {
                    console.info('pigpiod wird gestartet')

                    exec('sudo pigpiod -p 8887', (error, stdout, stderr) => {
                        if (error) {
                            reject(`Fehler beim Starten von pigpiod: ${stderr}`)
                        }
                        resolve(console.info('pigpiod gestartet'))
                    })
                }
            })
    })
}

export const enableRelaiPower = async () => {
    if (!isLinux) return console.info('not on linux, mocking relai on')
    const pin = 26

    return new Promise((res, rej) => {
        runCommandPigs(`pigs w ${pin} 0`, (_, err) => {
            if (err)
                rej(`Error enabling Relai: ${err}, command: pigs w ${pin} 0`)
            const msg = `GPIO wurde einsgeschaltet, Relai ist off`
            console.info(msg)
            res(msg)
        })
    })
}

export const disableRelaiPower = async () => {
    if (!isLinux) return console.info('not on linux, mocking relai off')
    const pin = 26

    return new Promise((res, rej) => {
        runCommandPigs(`pigs w ${pin} 1`, (_, err) => {
            if (err)
                rej(`Error enabling Relai: ${err}, command: pigs w ${pin} 0`)
            const msg = `GPIO wurde einsgeschaltet, Relai ist off`
            console.info(msg)
            res(msg)
        })
    })
}

export const checkGpioStatus = (pinKey: PinKey) => {
    const pin = pinList[pinKey]
    const command = `pigs r ${pin}`
    return new Promise((resolve, reject) => {
        runCommandPigs(command, (stdout, stderr) => {
            if (stderr) {
                console.error(`Fehler beim Abfragen des GPIO-Status: ${stderr}`)
                reject(stderr)
            }
            const status = parseInt(stdout.trim(), 10) === 1
            resolve(status)
        })
    })
}

export const getAllGpioStatus = async () => {
    const pinKeys = Object.keys(pinList) as PinKey[]
    const statusList = await Promise.all(
        pinKeys.map(async (key) => {
            let status: boolean | null = null

            try {
                status = (await checkGpioStatus(key)) as boolean
            } catch (error) {
                console.error(
                    `Fehler beim Abfragen des GPIO-Status für ${key}: ${error}`
                )
            }

            return { [key]: status }
        })
    )

    // turn it into a single string with "status key: status"
    return statusList.reduce((acc, curr) => {
        const key = Object.keys(curr)[0]
        const status = curr[key]
        return `${acc}\nstatus ${key}: ${status}`
    }, '')
}

// Funktion zum Ausführen von Shell-Befehlen
export const runCommand = (
    command: string,
    callback: (stdout: string, stderr: string) => void
) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Fehler beim Ausführen des Befehls: ${stderr}`)
            callback('', stderr)
            return
        }
        if (callback) callback(stdout, stderr)
    })
}

export const runCommandPigs = (
    command: string,
    callback: (stdout: string, stderr: string) => void
) => {
    const execCommand = `export PIGPIO_PORT=8887; ${command}`
    exec(execCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Fehler beim Ausführen des Befehls: ${stderr}`)
            callback('', stderr)
            return
        }
        if (callback) callback(stdout, stderr)
    })
}

export const enableGpio = async (pinKey: PinKey) => {
    if (!isLinux)
        return console.info(`nicht auf linux, mocking ${pinKey} eingeschaltet`)

    const isEnabled = await checkGpioStatus(pinKey)
    if (isEnabled) return
    if (isEnabled === null) return

    const pin = pinList[pinKey]
    runCommandPigs(`pigs w ${pin} 1`, (_, error) => {
        if (error) {
            console.error(`Fehler beim Einschalten von ${pinKey}: ${error}`)
        }
    })
}

export const disableGpio = async (pinKey: PinKey) => {
    if (!isLinux)
        return console.info(`nicht auf linux, mocking ${pinKey} ausgeschaltet`)

    const pin = pinList[pinKey]
    const isEnabled = await checkGpioStatus(pinKey)
    if (isEnabled === false) return
    if (isEnabled === null) return

    runCommandPigs(`pigs w ${pin} 0`, (_, error) => {
        if (error) {
            console.error(`Fehler beim Ausschalten von ${pinKey}: ${error}`)
        }
    })
}

export const handleRelaiChanges = (configData: Data, hasError: boolean) => {
    //  activate fan
    const fan = configData.generall.fan
    fan.current && fan.active && fan.sensor
        ? enableGpio(fan.sensor)
        : fan.sensor && disableGpio(fan.sensor)

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

        // disable all pumps if error
        if (hasError) return disableGpio(sensorLabel)

        plant.waterOn ? enableGpio(sensorLabel) : disableGpio(sensorLabel)
    })
}

export const disableI2c = async () => {
    return new Promise((resolve, _) => {
        const commands = ['sudo rmmod i2c_bcm2708', 'sudo rmmod i2c_dev']
        commands.forEach((command, index) => {
            runCommand(command, () => {
                if (index === commands.length - 1)
                    return resolve(console.info('I2C Bus wurde deaktiviert'))
            })
        })
    })
}
export const enableI2cBus = async () => {
    return new Promise((resolve, _) => {
        const commands = ['sudo modprobe i2c_bcm2708', 'sudo modprobe i2c_dev']
        commands.forEach((command, index) => {
            runCommand(command, () => {
                if (index === commands.length - 1)
                    return resolve(console.info('I2C Bus wurde aktualisiert'))
            })
        })
    })
}
export const wakeI2C = async () => {
    return new Promise((resolve, _) => {
        runCommand('sudo i2cdetect -y 1', () => {
            return resolve(console.info('I2C Bus gewekt'))
        })
    })
}
export const switchAllRelaisOnStart = async (enable: 'enable' | 'disable') => {
    const relais = Object.keys(pinList) as PinKey[]
    const promiseList = relais.map(async (pin, index) => {
        const time = 250 * index

        return new Promise((resolve) => {
            setTimeout(async () => {
                enable === 'enable'
                    ? await enableGpio(pin)
                    : await disableGpio(pin)
                resolve('')
            }, time)
        })
    })

    return Promise.all(promiseList)
}
