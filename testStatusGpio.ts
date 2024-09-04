import type { PinKey } from './types/sensor.js'
import { exec } from 'child_process'

export const pinList = {
    'A/1': 14,
    'A/2': 12,
    'A/3': 4,
    'A/4': 23,
    'A/5': 24,
    'A/6': 6,
    'A/7': 7,
}

const isLinux = process.platform === 'linux'

const enablePigpiod = async () => {
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

const runCommandPigs = (
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

const checkGpioStatus = (pinKey: PinKey) => {
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

await enablePigpiod()

Object.keys(pinList).forEach(async (key: string) => {
    const status = await checkGpioStatus(key as PinKey)
    console.log(`status key: ${key}`, status)
})
