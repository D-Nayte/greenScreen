import fs from 'fs'
import { SECOND_IN_MS } from './constant.js'
import { Data } from '../types/sensor.js'
import * as path from 'path'

export const readData = () => {
    let data = ''
    const dir = './data'
    const file = 'config.json'
    const initFile = 'initConfig.json'

    try {
        data = fs.readFileSync(path.join(dir, file), 'utf8')
    } catch (error) {
        data = fs.readFileSync(path.join(dir, initFile), 'utf8')
        fs.writeFileSync(path.join(dir, file), data, 'utf8')
    }

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
