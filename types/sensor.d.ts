declare module "bme280-sensor";

export declare type EnvSensorData = {
  temperature_C: number;
  humidity: number;
  pressure_hPa: number;
};

export type SoilLabelList = keyof Data["sensors"]["adcSensors"];

export type Data = {
  generall: {
    temperature: {
      min: number;
      max: number;
      active: boolean;
      current: number;
      sensor: number;
    };
    humidityAir: {
      min: number;
      max: number;
      active: boolean;
      current: number;
      sensor: number | null;
    };
    light: {
      active: boolean;
      current: number;
      sensor: number;
    };
    pressure: {
      min: number;
      max: number;
      active: boolean;
      current: number;
      sensor: number;
    };
    fan: {
      active: boolean;
      current: number;
      sensor: number;
    };
  };
  plantConfig: {
    id: number;
    soilName: string;
    name: string;
    humiditySoil: string;
    waterOn: boolean;
    usehumiditySoil: boolean;
    soilSensor: SoilLabelList | null;
    usePump: boolean;
    pumpSensor: number | null;
    startPump: number;
    stopPump: number;
  }[];
  sensors: {
    adcSensors: {
      "E/01": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/02": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/03": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/04": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/05": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/06": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/07": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/08": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      "E/09": {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
    };
  };
};
