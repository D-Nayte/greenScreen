import { exec, spawn } from 'child_process'
const folderPath = 'sensor/adc.py'
const py = 'pythonVirtual/bin/python3'

export const readAdcData = () => {
    const readProcess = spawn(py, [folderPath])

    return new Promise((resolve, reject) => {
        readProcess.stdout.on('data', (data) => {
            const dataString = `${data}`
            console.log('dataString', dataString)

            if (dataString.startsWith('sensorData:'))
                return resolve(
                    JSON.parse(
                        dataString.split('sensorData:')[1].replace(/'/g, '"')
                    )
                )

            // resolve(JSON.parse(dataString.replace(/'/g, '"')) as ReadDat)
        })

        readProcess.stderr.on('data', (data) => {
            console.error(`${data}`)

            resolve(`${data}`)
        })
    })
}

setInterval(readAdcData, 500)
