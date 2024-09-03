import { PinKey } from './types/sensor.js'
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

//get inputs from CLI
const args = process.argv.slice(2)

function isPinKey(value: any): value is PinKey {
    return ['A/1', 'A/2', 'A/3', 'A/4', 'A/5', 'A/6', 'A/7'].includes(value)
}

const validateArgs = (args: string[]) => {
    if (args.length !== 2) {
        console.error('Wrong number of arguments')
        return false
    }

    //args[0] must be 'enable' or 'disable'

    if (!args[0].includes('enable') && !args[0].includes('disable')) {
        console.error("First argument must be 'enable' or 'disable'")
        return false
    }

    if (!args[0].includes('enable') && !args[0].includes('disable')) {
        console.error("First argument must be 'enable' or 'disable'")
        return false
    }

    //args[2] must be of type PinKey
    if (!isPinKey(args[1])) {
        console.error('Second argument must be a valid PinKey')
        //print available pinKeys
        console.info('Available pinKeys: ', Object.keys(pinList))

        return false
    }

    return true
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

const enableGpio = async (pinKey: PinKey) => {
    if (!isLinux) return console.info(`NOT ON LINUX`)

    const pin = pinList[pinKey]
    runCommandPigs(`pigs w ${pin} 1`, (_, error) => {
        if (error) {
            console.error(`Fehler beim Einschalten von ${pinKey}: ${error}`)
        }
    })
}

const disableGpio = async (pinKey: PinKey) => {
    if (!isLinux) return console.info(`NOT ON LINUX`)

    const pin = pinList[pinKey]

    runCommandPigs(`pigs w ${pin} 0`, (_, error) => {
        if (error) {
            console.error(`Fehler beim Ausschalten von ${pinKey}: ${error}`)
        }
    })
}

const isValid = validateArgs(args)

if (isValid) {
    const enable = args[0].includes('enable')
    const pinKey = args[1] as PinKey

    enable ? enableGpio(pinKey) : disableGpio(pinKey)
}
