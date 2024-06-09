import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ESM spezifische Implementierung für __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const logDir = path.join(__dirname, 'logs')
const logPath = path.join(logDir, 'system_logs.txt')

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

export const logSystemInfo = async () => {
    const logs = {
        journalctl: '',
        dmesg: '',
        free: '',
        top: '',
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

        // Logs in lesbarem Format formatieren
        const formattedLogs = formatForHumanReading(logs)

        // Logs in Datei speichern
        //   const logPath = path.join(__dirname, 'system_logs.txt');
        fs.writeFileSync(logPath, formattedLogs)

        console.log(`Logs have been saved to ${logPath}`)
    } catch (error) {
        console.error('Error logging system info:', error)
    }
}
