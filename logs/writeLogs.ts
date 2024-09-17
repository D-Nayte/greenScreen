import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ESM spezifische Implementierung für __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const logPath = path.join(__dirname, 'system_logs.txt')
const errorLogPath = path.join(__dirname, 'error_logs.txt')

// Funktion zum Ausführen von Shell-Befehlen und Rückgabe der Ausgabe
const runCommand = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            } else {
                resolve(stdout || stderr)
            }
        })
    })
}

const filterAndFormatLogs = (logs: string) => {
    const importantKeywords = ['error', 'failed', 'warning', 'critical']
    return logs
        .split('\n')
        .filter((line) =>
            importantKeywords.some((keyword) =>
                line.toLowerCase().includes(keyword)
            )
        )
        .map((line) => line.trim())
        .join('\n')
}

const formatForHumanReading = (logs: object) => {
    return Object.entries(logs)
        .map(([key, value]) => {
            return `--- ${key.toUpperCase()} ---\n${value}\n\n`
        })
        .join('')
}

export const writeErrorLogFile = (error: string) => {
    const dateTime = new Date().toLocaleString()
    const devider = '--------------------------------\n'
    const errorLogFile = `${dateTime}; ${error}\n${devider}`

    //checik if the file exists, if not create it
    if (!fs.existsSync(errorLogPath)) {
        fs.writeFileSync(errorLogPath, '')
    }

    //bvefore adding the error, check if the error is already in the file, if so, replace it wit the current date^
    const errorLogContent = fs.readFileSync(errorLogPath, 'utf-8')
    if (errorLogContent.includes(error)) {
        const errorList = errorLogContent
            .split(devider)
            .filter((line) => line && line !== '\n')
            .map((line) => line.split('; '))
        const changedDate = errorList
            .map((line) => {
                if (line[1].trim() === error.trim()) {
                    return `${dateTime}; ${error}`
                }
                return line.join('; ')
            })
            .join(devider)

        fs.writeFileSync(errorLogPath, changedDate)
        return
    }

    fs.appendFileSync(errorLogPath, errorLogFile)
    console.info(`Error has been saved to ${errorLogPath}`)
}

export const logSystemInfo = async (readOnly?: boolean) => {
    const logs = {
        journalctl: '',
        dmesg: '',
        free: '',
        top: '',
        temp: '',
        date: '',
    }

    try {
        // Systemd Journal für allgemeine Systemlogs
        const journalctlLogs = await runCommand('journalctl -n 100')
        logs.journalctl = filterAndFormatLogs(journalctlLogs as string)

        // Kernel Logs
        const dmesgLogs = await runCommand('dmesg')
        logs.dmesg = filterAndFormatLogs(dmesgLogs as string)

        // Überprüfen des freien Speichers
        const freeLogs = await runCommand('free -h')
        logs.free = freeLogs

        // CPU und Speicherlast
        const topLogs = await runCommand('top -bn1 | head -n 20')
        logs.top = topLogs

        const temp = await runCommand('vcgencmd measure_temp')
        logs.temp = temp

        logs.date = new Date().toLocaleString()

        // Logs in lesbarem Format formatieren
        const formattedLogs = formatForHumanReading(logs)

        // Logs in Datei speichern
        if (!readOnly) {
            fs.writeFileSync(logPath, formattedLogs)
            console.info(`Logs have been saved to ${logPath}`)
        }

        return formattedLogs
    } catch (error) {
        console.error('Error logging system info:', error)
    }
}
