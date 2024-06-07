import express from 'express'
import next from 'next'
import http from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv'
import { handleEnvChange, initEnvSensor } from './sensor/envSensor'
import {
    getConfigData,
    serverIntervall,
    writeData,
} from './utils/readConfig.js'
import { SECOND_IN_MS } from './utils/constant.js'
import { Data, SoilLabelList } from './types/sensor.js'
import {
    calibrateAdcSensors,
    handleAdcMoistureChange,
} from './sensor/adcSensor'
import { enableRelaiPower, handleRelaiChanges } from './sensor/gipo'
import { handleLightSensor } from './sensor/lightSensor'

config()
await initEnvSensor()
enableRelaiPower()

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
const PORT = process.env.WEBSOCKET_PORT || 3000

const readSensors = async () => {
    const shouldWriteData = { change: false }
    const configData = getConfigData()

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
            const newData = writeData(data)

            io.emit('sendData', newData)
        })

        socket.on('getData', async () => {
            const data = getConfigData()
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

    httpServer.listen(PORT, () => {
        console.info(`Server is running on http://localhost:${PORT}`)
        // activate sensor rotation
        setInterval(async () => {
            console.info(`Starting sensor reading`)
            await readSensors()
        }, serverIntervall)
    })
})
