import express from 'express'
import next from 'next'
import http from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv'
import { handleEnvChange, initEnvSensor } from './sensor/envSensor'
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
} from './sensor/adcSensor'
import {
    enableRelaiPower,
    handleRelaiChanges,
    disableI2c,
    enableI2cBus,
    enablePigpiod,
    wakeI2C,
    disbaleAllRelaisOnStart,
} from './sensor/gipo'
import { logSystemInfo } from './logs/writeLogs'
import { MINUTES_IN_MS } from './utils/constant'

await disableI2c()
config()

await enablePigpiod()
await enableI2cBus()
await disbaleAllRelaisOnStart()
await initEnvSensor()
await wakeI2C()

export interface ServerToClientEvents {
    noArg: () => void
    basicEmit: (a: number, b: string, c: Buffer) => void
    withAck: (d: string, callback: (e: number) => void) => void
    sendData: (data: Data) => void
    sendConfig: (data: Data) => void
    calibrationMessage: (data: string) => void
}

export interface ClientToServerEvents {
    message: (data: string) => void
    getData: () => void
    setData: (data: Data) => void
    calibrateMoisSensor: (sensor: SoilLabelList) => void
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
const PORT = 3001

let data: Data = readData()
let newFromFrontend: Data | null = null

const readSensors = async () => {
    const shouldWriteData = { change: false }
    // const configData = getConfigData()
    const configData = newFromFrontend ? { ...newFromFrontend } : { ...data }

    newFromFrontend && (newFromFrontend = null)

    try {
        await handleEnvChange(configData, shouldWriteData)
    } catch (error) {
        console.error(error)
    }

    try {
        await handleAdcMoistureChange(configData, shouldWriteData)
    } catch (error) {
        console.error(error)
    }

    // try {
    //     handleLightSensor(configData)
    // } catch (error) {
    //     console.error(error)
    // }

    handleRelaiChanges(configData)

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

        socket.on('setData', (data: Data) => {
            // const newData = writeData(data)
            newFromFrontend = data

            io.emit('sendData', newFromFrontend)
        })

        socket.on('getData', async () => {
            // const data = getConfigData()
            io.emit('sendData', data)
        })

        socket.on('calibrateMoisSensor', async (sensor: SoilLabelList) => {
            await calibrateAdcSensors(sensor, socket)
            const newData = getConfigData()

            io.emit('sendData', newData)
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
                logSystemInfo()
            }, MINUTES_IN_MS[3])
        }, 5000)
    })
})
