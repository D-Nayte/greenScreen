import { exec } from "child_process";

const runTest = () => {
  exec("sudo i2cdetect -y 1", (error, stdout, stderr) => {
    if (error) {
      // console.error(`Fehler beim Abfragen des GPIO-Status: ${stderr}`);
      console.error(`error :>> ${error}`);
    } else {
      console.log("stdout :>> ", stdout);
    }
  });
};

setInterval(runTest, 500);
