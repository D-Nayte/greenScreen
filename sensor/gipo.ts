import { exec } from "child_process";

// Definiere den Pin (BCM 4 entspricht physischem Pin 7)
const pin = 4;

const pinList = {
  GPIO4: 4,
  GPIO17: 17,
  GPIO27: 27,
  GPIO22: 22,
  GPIO5: 5,
  GPIO6: 6,
  GPIO13: 13,
  GPIO19: 19,

  GPIO14: 14,
  GPIO15: 15,
  GPIO18: 18,
  GPIO23: 23,
  GPIO24: 24,
  GPIO25: 25,
  GPIO12: 12,
  GPIO16: 16,
  GPIO20: 20,
  GPIO21: 21,
};

type PinKey = keyof typeof pinList;

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

export const enableGpio = (pinKey: PinKey) => {
  const pin = pinList[pinKey];
  runCommand(`pigs w ${pin} 1`, () => {
    console.log(`${pinKey} wurde eingeschaltet`);
  });
};

export const disableGpio = (pinKey: PinKey) => {
  const pin = pinList[pinKey];
  runCommand(`pigs w ${pin} 0`, () => {
    console.log(`${pinKey} wurde ausgeschaltet`);
  });
};

// Schalte den Pin ein
runCommand(`pigs w ${pin} 1`, () => {
  console.log("Pin wurde eingeschaltet");

  // Schalte den Pin nach 3 Sekunden wieder aus
  setTimeout(() => {
    runCommand(`pigs w ${pin} 0`, () => {
      console.log("Pin wurde ausgeschaltet");

      // Cleanup (falls erforderlich)
      runCommand(`pigs w ${pin} 0`, () => {
        console.log("GPIO Cleanup durchgeführt");
      });
    });
  }, 3000);
});
