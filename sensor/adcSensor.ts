import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import config from '../data/config.json' assert { type: 'json' }
import { Data, SoilLabelList } from '../types/sensor'
import { readData, writeData } from '../utils/readConfig'
import { SECOND_IN_MS } from '../utils/constant'
import { Socket } from 'socket.io'
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from '../server'
import MockChildProcess from './mockCalibration'

type CalData = {
    h_0_min_cal: number
    h_100_max_cal: number
}
type ReadDat = { sensor: SoilLabelList; humidity: number }[]

type RunningPumps = {
    pumpSensor: string
    runningTime: number // in seconds
    throughput: number // liter per hour
    pourAmount: number // in litera
}

const folderPath = 'sensor/adc.py'
const py = 'pythonVirtual/bin/python3'
const isLinux = process.platform === 'linux'
const currentlyRunningPumps: RunningPumps[] = []
const pumpReadIntervall = SECOND_IN_MS[5]

// const readProcess = spawn(py, [folderPath]);

// readProcess.stdout.on("data", (data) => {
//   console.log(`stdout: ${data}`);
// });

// readProcess.stderr.on("data", (data) => {
//   console.error(`stderr: ${data}`);
// });

// readProcess.on("close", (code) => {
//   console.log(`child process exited with code ${code}`);
// });

// // check if the readProcess is running, if not start it
// if (readProcess.killed) {
//   readProcess = spawn("pythonVirtual/bin/python3");
// }

// setInterval(() => {
//   if (readProcess.killed) {
//     readProcess = spawn("pythonVirtual/bin/python3");
//   }
// } , 1000);

export const readAdcData = (): Promise<ReadDat> => {
    if (!isLinux) {
        const { plantConfig } = readData()
        const data = {
            sensor: plantConfig[0]?.soilSensor || 'E/01',
            humidity: parseInt(plantConfig[0]?.humiditySoil || '0'),
        }
        return Promise.resolve([data])
    }

    const readProcess = spawn(py, [folderPath])

    return new Promise((resolve, reject) => {
        readProcess.stdout.on('data', (data) => {
            const dataString = `${data}`

            resolve(JSON.parse(dataString.replace(/'/g, '"')) as ReadDat)
        })

        readProcess.stderr.on('data', (data) => {
            reject()
        })
    })
}

export const calibrateAdcSensors = (
    sensorLabel: SoilLabelList,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >
): Promise<CalData> => {
    const adcSensors = config.sensors.adcSensors
    const { address, channel } = adcSensors[sensorLabel]
    const calParams = [
        folderPath,
        '--calibrate',
        '-addr',
        address,
        '-chan',
        channel,
    ]

    let readProcess: ChildProcessWithoutNullStreams

    if (isLinux) {
        readProcess = spawn(py, calParams)
    } else {
        const mockProcess = new MockChildProcess()
        readProcess = mockProcess as unknown as ChildProcessWithoutNullStreams

        const intervallID = setInterval(() => {
            mockProcess.stdout.emit('data', 'mokcing calibration data')
        }, 1000)

        setTimeout(() => {
            clearInterval(intervallID)
            mockProcess.stdout.emit(
                'data',
                'Calibration Data: {"h_0_min_cal": 300, "h_100_max_cal": 900}'
            )
        }, 8000)
    }

    return new Promise((resolve, reject) => {
        readProcess.stdout.on('data', (data) => {
            const dataString = `${data}`

            if (!dataString.includes('Calibration Data: ')) {
                socket.emit('calibrationMessage', dataString)
                //  console.log('data :>> ', dataString)
                return
            }

            const [_, calDataJSOn] = dataString.split('Calibration Data: ')
            const { h_0_min_cal, h_100_max_cal } = JSON.parse(
                calDataJSOn
            ) as CalData
            const configData = readData()
            configData.sensors.adcSensors[sensorLabel] = {
                ...configData.sensors.adcSensors[sensorLabel],
                h_0_min: h_0_min_cal,
                h_100_max: h_100_max_cal,
            }
            writeData(configData)
            socket.emit('calibrationMessage', 'Done')
            resolve({ h_0_min_cal, h_100_max_cal })
        })

        readProcess.stderr.on('data', (data) => {
            reject()
        })
    })
}

export const handleAdcMoistureChange = async (
    configData: Data,
    shouldWriteData: { change: boolean }
) => {
    try {
        const adcData = await readAdcData()
        const adcSensors = configData.sensors.adcSensors

        for (const { sensor, humidity } of adcData) {
            const sensorConfig = adcSensors[sensor]
            let { activeToId } = sensorConfig
            let plantIndex = 0
            const plants = [...configData.plantConfig]
            let plant = plants.find((plant, index) => {
                plantIndex = index
                return plant.id === activeToId
            })!
            const {
                startPump,
                waterOn,
                throughput,
                pourAmount,
                timeLeftPouring,
                usePump,
            } = plant
            const humityisLow = humidity < startPump
            const pumpisRunning = currentlyRunningPumps
                .map((p) => p.pumpSensor)
                .includes(sensor)
            const pumpIsDonePouring =
                currentlyRunningPumps.find((p) => p.pumpSensor === sensor)
                    ?.runningTime === 0
            if (usePump) {
                if (humityisLow && !waterOn) {
                    plants[plantIndex].waterOn = true
                    const timneToRun = (pourAmount / (throughput / 3600)) * 1000
                    plants[plantIndex].timeLeftPouring = timneToRun
                    currentlyRunningPumps.push({
                        pumpSensor: sensor,
                        runningTime: timneToRun,
                        throughput,
                        pourAmount: pourAmount,
                    })
                    shouldWriteData.change = true
                }
                if (pumpisRunning && !pumpIsDonePouring) {
                    const timeLEft =
                        currentlyRunningPumps.find(
                            (p) => p.pumpSensor === sensor
                        )?.runningTime || 0
                    plants[plantIndex].timeLeftPouring = timeLEft

                    shouldWriteData.change = true
                }

                if (pumpisRunning && pumpIsDonePouring) {
                    plants[plantIndex].waterOn = false
                    plants[plantIndex].timeLeftPouring = 0
                    currentlyRunningPumps.splice(
                        currentlyRunningPumps.findIndex(
                            (p) => p.pumpSensor === sensor
                        ),
                        1
                    )
                    shouldWriteData.change = true
                }
            }

            plants[plantIndex] = {
                ...plants[plantIndex],
                humiditySoil: humidity.toString(),
            }

            const pumpNotInUse = !currentlyRunningPumps.find(
                (p) => p.pumpSensor === sensor
            )
            const pumpNotInUseAndWaterOn =
                pumpNotInUse && plants[plantIndex].waterOn

            // //fallback is water is on put no pumpmps inside the array
            if (pumpNotInUseAndWaterOn) {
                console.info(
                    '--------------------------------------------------'
                )
                console.info(
                    'Pump not in use, but water is on! Fallback triggered!'
                )
                console.info(
                    '--------------------------------------------------'
                )
                plants[plantIndex].waterOn = false
                plants[plantIndex].timeLeftPouring = 0
                shouldWriteData.change = true
            }

            configData.plantConfig = [...plants]
        }
    } catch (error) {
        throw new Error(`Couldn't read adc data sensor, ${error}`)
    }
}

setInterval(() => {
    currentlyRunningPumps.forEach((pump) => {
        pump.runningTime -= pumpReadIntervall
        if (pump.runningTime <= 0) pump.runningTime = 0
    })
}, pumpReadIntervall)
