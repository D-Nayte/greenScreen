import express from 'express'
import next from 'next'
import http from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv'
import { handleEnvChange } from './sensor/envSensor.js'
import {
    getConfigData,
    readData,
    serverIntervall,
    writeData,
} from './utils/readConfig.js'
import { Data, SoilLabelList } from './types/sensor.js'
import {
    calibrateAdcSensors,
    getCalibratetValues,
    handleAdcMoistureChange,
} from './sensor/adcSensor.js'
import {
    enableRelaiPower,
    handleRelaiChanges,
    disableI2c,
    enableI2cBus,
    enablePigpiod,
    wakeI2C,
    disbaleAllRelaisOnStart,
} from './sensor/gipo.js'
import { logSystemInfo } from './logs/writeLogs.js'
import { MINUTES_IN_MS } from './utils/constant.js'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'

config()

await disableI2c()
await enablePigpiod()
await enableI2cBus()
await disbaleAllRelaisOnStart()
await wakeI2C()

export interface ServerToClientEvents {
    noArg: () => void
    basicEmit: (a: number, b: string, c: Buffer) => void
    withAck: (d: string, callback: (e: number) => void) => void
    sendData: (data: Data) => void
    sendConfig: (data: Data) => void
    calibrationMessage: (data: string) => void
    sendLogs: (logs: string) => void
    sendVideoStream: (data: String) => void
}

export interface ClientToServerEvents {
    message: (data: string) => void
    getData: () => void
    setData: (data: Data) => void
    calibrateMoisSensor: (sensor: SoilLabelList) => void
    getLogs: () => void
    getVideoStream: () => void
}

export interface InterServerEvents {
    ping: () => void
}

export interface SocketData {
    name: string
    age: number
}

const args = process.argv
const dev = args[2] !== '--prod'
const app = next({ dev })
const handle = app.getRequestHandler()
const PORT = 3000

let data: Data = readData()
let newFromFrontend: Data | null = null

const readSensors = async () => {
    const shouldWriteData = { change: false }
    // const configData = getConfigData()
    const configData = newFromFrontend ? { ...newFromFrontend } : { ...data }
    let hasError = false

    newFromFrontend && (newFromFrontend = null)

    try {
        await handleEnvChange(configData, shouldWriteData)
    } catch (error) {
        hasError = true
        console.error(error)
    }

    try {
        await handleAdcMoistureChange(configData, shouldWriteData)
    } catch (error) {
        hasError = true
        console.error(error)
    }

    handleRelaiChanges(configData, hasError)

    //apply sensor calibartions
    Object.entries(configData.sensors.adcSensors).forEach(([key, value]) => {
        const calibratedData = getCalibratetValues(key as SoilLabelList)
        configData.sensors.adcSensors[key as SoilLabelList] = {
            ...value,
            ...calibratedData,
        }
    })

    data = { ...configData }

    return shouldWriteData.change ? writeData(configData) : configData
}

app.prepare().then(async () => {
    const server = express()
    const httpServer = http.createServer(server)
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(httpServer, {
        cors: {
            origin: '*',
        },
    })

    io.on('connection', (socket) => {
        console.info('Client connected')
        let ffmpeg: ChildProcessWithoutNullStreams | null = null

        socket.on('setData', (data: Data) => {
            writeData(data)
            newFromFrontend = data

            io.emit('sendData', newFromFrontend)
        })

        socket.on('getData', async () => {
            // const data = getConfigData()
            io.emit('sendData', data)
        })

        socket.on('calibrateMoisSensor', async (sensor: SoilLabelList) => {
            await calibrateAdcSensors(sensor, socket, data)
            const newData = getConfigData()

            io.emit('sendData', newData)
        })

        // socket.on('getVideoStream', async () => {
        //     if (!ffmpeg) {
        //         ffmpeg = spawn('ffmpeg', [
        //             '-i',
        //             '/dev/video0',
        //             '-vb',
        //             '1M',
        //             '-b:v',
        //             '1M',
        //             '-video_size',
        //             '1280x720',
        //             '-crf',
        //             '26',
        //             '-preset',
        //             'veryfast',
        //             '-acodec',
        //             'copy',
        //             '-f',
        //             'mjpeg',
        //             'pipe:1',
        //             '-loglevel',
        //             'error',
        //         ])
        //     }

        //     ffmpeg.stdout.on('data', (data) => {
        //         const frame = Buffer.from(data).toString('base64')
        //         io.emit('sendVideoStream', frame)
        //     })

        //     ffmpeg.stderr.on('data', (data) => {
        //         console.error(`ffmpeg stderr: ${data}`)
        //     })

        //     ffmpeg.on('close', (code) => {
        //         console.info(`ffmpeg process exited with code ${code}`)
        //     })
        //     socket.on('disconnect', () => {
        //         if (ffmpeg) {
        //             ffmpeg.kill('SIGINT')
        //             ffmpeg = null
        //         }
        //     })
        // })

        socket.on('getLogs', async () => {
            const logs = await logSystemInfo()
            socket.emit('sendLogs', logs || 'No logs found')
        })
    })

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    httpServer.listen(PORT, async () => {
        console.info(`Server is running on http://localhost:${PORT}`)

        setTimeout(async () => {
            await enableRelaiPower()

            // activate sensor rotation
            setInterval(async () => {
                await readSensors()
            }, serverIntervall)

            // frequently log system info
            setInterval(async () => {
                await logSystemInfo()
            }, MINUTES_IN_MS[3])
        }, 5000)
    })
})
