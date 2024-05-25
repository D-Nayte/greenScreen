import { spawn } from "child_process";
import config from "../data/config.json" assert { type: "json" };
import { Data, SoilLabelList } from "../types/sensor";
// import { getConfigData } from "../utils/readConfig";

type CalData = {
  h_0_min_cal: number;
  h_100_max_cal: number;
};
type ReadDat = { sensor: SoilLabelList; humidity: number }[];

const folderPath = "sensor/adc.py";
const py = "pythonVirtual/bin/python3";
const isLinux = process.platform === "linux";

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
  if (!isLinux) return Promise.resolve([{ sensor: "E/01", humidity: 50 }]);

  const readProcess = spawn(py, [folderPath]);

  return new Promise((resolve, reject) => {
    readProcess.stdout.on("data", (data) => {
      const dataString = `${data}`;

      resolve(JSON.parse(dataString.replace(/'/g, '"')) as ReadDat);
    });

    readProcess.stderr.on("data", (data) => {
      reject();
    });
  });
};

export const calibrateAdcSensors = (
  sensorLabel: SoilLabelList
): Promise<CalData> => {
  const adcSensors = config.sensors.adcSensors;
  const { address, channel } = adcSensors[sensorLabel];
  const calPrams = [
    folderPath,
    "--calibrate",
    "-addr",
    address,
    "-chan",
    channel,
  ];

  const readProcess = spawn(py, calPrams);

  return new Promise((resolve, reject) => {
    readProcess.stdout.on("data", (data) => {
      const dataString = `${data}`;

      if (!dataString.includes("Calibration Data: "))
        return console.log("data :>> ", dataString);
      const [_, calDataJSOn] = dataString.split("Calibration Data: ");
      resolve(JSON.parse(calDataJSOn) as CalData);
    });

    readProcess.stderr.on("data", (data) => {
      reject();
    });
  });
};

export const handleAdcMoistureChange = async (
  configData: Data,
  shouldWriteData: { change: boolean }
) => {
  try {
    const adcData = await readAdcData();
    const adcSensors = configData.sensors.adcSensors;

    for (const { sensor, humidity } of adcData) {
      const sensorConfig = adcSensors[sensor];
      let { activeToId } = sensorConfig;
      let plantIndex = 0;
      const plants = configData.plantConfig;
      let plant = plants.find((plant, index) => {
        plantIndex = index;
        return plant.id === activeToId;
      })!;
      const { startPump, stopPump, waterOn } = plant;
      const humityInRange = humidity > startPump && humidity < stopPump;

      if (!humityInRange) {
        const humityBelowMin = humidity < startPump;
        const humityAboveMax = humidity > stopPump;
        const pumpShouldStart = !waterOn
          ? humityBelowMin
          : humityAboveMax
          ? false
          : waterOn;

        pumpShouldStart !== waterOn && (shouldWriteData.change = true);
        plants[plantIndex].waterOn = pumpShouldStart;
      }

      plants[plantIndex] = {
        ...plants[plantIndex],
        humiditySoil: humidity.toString(),
      };

      configData.plantConfig = [...plants];
    }
  } catch (error) {
    throw new Error(`Couldn't read adc data sensor, ${error}`);
  }
};
