import fs from 'fs'
import { SECOND_IN_MS } from './constant'
import { Data } from '../types/sensor'

export const readData = (init?: string) => {
    const path = init ? './data/initConfig.json' : './data/config.json'
    const data = fs.readFileSync('./data/config.json', 'utf8')
    return JSON.parse(data) as Data
}

let configData: Data = readData()
export const serverIntervall = SECOND_IN_MS[3]

export const writeData = (data: Data) => {
    fs.writeFileSync(
        './data/config.json',
        JSON.stringify(data, null, 2),
        'utf8'
    )
    const newData = readData()
    configData = newData
    return newData
}

setInterval(() => {
    configData = readData()
}, serverIntervall - 500)

export function getConfigData() {
    return configData
}
