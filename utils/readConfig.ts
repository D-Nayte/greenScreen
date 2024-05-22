import fs from 'fs';
import { MINUTES_IN_MS, SECOND_IN_MS } from './constant';
import { Data } from '../types/sensor';

export const readData = () => {
  const data = fs.readFileSync('./data/config.json', 'utf8');
  return JSON.parse(data) as Data;
};

export const writeData = (data: Data) => {
  fs.writeFileSync('./data/config.json', JSON.stringify(data, null, 2), 'utf8');
  const newData = readData();
  return newData;
};

let configData: Data = readData();

setInterval(() => {
  configData = readData();
}, MINUTES_IN_MS[5]);

export function getConfigData() {
  return configData;
}
