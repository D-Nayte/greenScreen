import { exec } from 'child_process'

export const readEnvSensor = async () => {
    return new Promise((resolve, reject) => {
        exec('python sensor/env.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Fehler beim lesen des Env sensors: ${stderr}`)

                reject()
            }

            const data = JSON.parse(stdout)
            const formatted = {
                temperature: parseFloat(data?.temperature.toFixed(2)),
                humidity: parseFloat(data?.humidity.toFixed(2)),
            }

            console.log('formatted :>> ', formatted)

            resolve(formatted)
        })
    })
}

setInterval(async () => {
    console.log(await readEnvSensor())
}, 1000)
