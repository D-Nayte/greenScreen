import { exec } from "child_process";
import { Data, PinKey } from "../types/sensor";
import { pinList } from "../utils/constant";

export const enableRelaiPower = async () => {
  const pin = 26;

  runCommand(`pigs w ${pin} 0`, () => {
    console.log(`GPIO wurde ausgeschaltet, Relai if off `);
  });
};

export const disableRelaiPower = async () => {
  const pin = 26;

  runCommand(`pigs w ${pin} 1`, () => {
    console.log(`GPIO wurde einsgeschaltet, Relai if on`);
  });
};

exec("pgrep pigpiod", (error, stdout, stderr) => {
  if (stdout) {
    console.log("pigpiod läuft bereits");
  } else {
    console.log("pigpiod läuft nicht");

    exec("sudo pigpiod", (error, stdout, stderr) => {
      if (error) {
        console.error(`Fehler beim Starten von pigpiod: ${stderr}`);
        return;
      }
      console.log("pigpiod gestartet");
    });
  }
});

export const checkGpioStatus = (pinKey: PinKey) => {
  const pin = pinList[pinKey];
  const command = `pigs r ${pin}`;
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // console.error(`Fehler beim Abfragen des GPIO-Status: ${stderr}`);
        resolve(null);
      } else {
        // 0 bedeutet LOW, 1 bedeutet HIGH
        const status = parseInt(stdout.trim(), 10) === 1;
        console.log(null, status);
        resolve(status);
      }
    });
  });
};

// Funktion zum Ausführen von Shell-Befehlen
const runCommand = (command: string, callback: (stdout: string) => void) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler beim Ausführen des Befehls: ${stderr}`);
      return;
    }
    if (callback) callback(stdout);
  });
};

export const enableGpio = async (pinKey: PinKey) => {
  const isEnabled = await checkGpioStatus(pinKey);
  if (isEnabled) return console.log(`${pinKey} ist bereits eingeschaltet`);
  if (isEnabled === null) return console.log(`${pinKey} nicht angeschlossen!`);

  const pin = pinList[pinKey];
  runCommand(`pigs w ${pin} 1`, () => {
    console.log(`${pinKey} wurde eingeschaltet`);
  });
};

export const disableGpio = async (pinKey: PinKey) => {
  const pin = pinList[pinKey];
  const isEnabled = await checkGpioStatus(pinKey);
  if (isEnabled === false)
    return console.log(`${pinKey} ist bereits ausgeschaltet`);
  if (isEnabled === null) return console.log(`${pin} nicht angeschlossen!`);

  runCommand(`pigs w ${pin} 0`, () => {
    console.log(`${pinKey} wurde ausgeschaltet`);
  });
};

export const handleRelaiChanges = (configData: Data) => {
  //  activate fan
  const fan = configData.generall.fan;
  fan.current && fan.active
    ? enableGpio(fan.sensor!)
    : disableGpio(fan.sensor!);

  //  activate plant pumps
  const plants = configData.plantConfig.filter(
    (plant) => plant.usePump && plant.pumpSensor
  );

  plants.forEach((plant) => {
    // enableGpio(plant.pumpSensor as PinKey);
    const sensorLabel = plant.pumpSensor!;

    // const senroKey = pinList[sensorLabel]
    plant.waterOn ? enableGpio(sensorLabel) : disableGpio(sensorLabel);
  });
};
