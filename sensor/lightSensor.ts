import i2c from "i2c-bus";
import { Data } from "../types/sensor";
import { getConfigData } from "../utils/readConfig";

const TSL2561_ADDRESS = 0x39;
const TSL2561_COMMAND_BIT = 0x80;
const TSL2561_CONTROL_POWERON = 0x03;
const TSL2561_CONTROL_POWEROFF = 0x00;
const TSL2561_REGISTER_CONTROL = 0x00;
const TSL2561_REGISTER_CHAN0_LOW = 0x0c;
const TSL2561_REGISTER_CHAN1_LOW = 0x0e;
const isLinux = process.platform === "linux";

const bus = i2c.openSync(1);

function writeByte(addr: number, cmd: number, byte: number) {
  bus.writeByteSync(addr, cmd, byte);
}

function _readWord(addr: number, cmd: number) {
  const low = bus.readByteSync(addr, cmd);
  const high = bus.readByteSync(addr, cmd + 1);
  return (high << 8) | low;
}
//
// function powerOn() {
isLinux &&
  writeByte(
    TSL2561_ADDRESS,
    TSL2561_COMMAND_BIT | TSL2561_REGISTER_CONTROL,
    TSL2561_CONTROL_POWERON
  );
// }

// function powerOff() {
//   writeByte(
//     TSL2561_ADDRESS,
//     TSL2561_COMMAND_BIT | TSL2561_REGISTER_CONTROL,
//     TSL2561_CONTROL_POWEROFF
//   );
// }

function _readLux() {
  //   powerOn();
  //   setTimeout(() => {

  if (!isLinux) return 10;

  try {
    const data0 = _readWord(
      TSL2561_ADDRESS,
      TSL2561_COMMAND_BIT | TSL2561_REGISTER_CHAN0_LOW
    );
    const data1 = _readWord(
      TSL2561_ADDRESS,
      TSL2561_COMMAND_BIT | TSL2561_REGISTER_CHAN1_LOW
    );
    // powerOff();

    if (data0 === 0) {
      console.info("Lux: 0 (Sensor error or insufficient light)");
      return;
    }

    const ratio = data1 / data0;
    let lux;
    if (ratio <= 0.5) {
      lux = 0.0304 * data0 - 0.062 * data0 * Math.pow(ratio, 1.4);
    } else if (ratio <= 0.61) {
      lux = 0.0224 * data0 - 0.031 * data1;
    } else if (ratio <= 0.8) {
      lux = 0.0128 * data0 - 0.0153 * data1;
    } else if (ratio <= 1.3) {
      lux = 0.00146 * data0 - 0.00112 * data1;
    } else {
      lux = 0;
    }

    return parseFloat(lux.toFixed(2));
  } catch (error) {
    throw new Error(`Error in reading light sensor: ${error}`);
  }
  // console.log(`Lux: ${lux}`);
  //   }, 500);
}

export const handleLightSensor = (confiData: Data) => {
  const lux = _readLux();

  if (!lux) return;
  confiData.generall.light.current = lux;
};
