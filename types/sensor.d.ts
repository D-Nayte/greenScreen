declare module 'bme280-sensor';

export declare type EnvSensorData = {
  temperature_C: number;
  humidity: number;
  pressure_hPa: number;
};

export type SoilLabelList = keyof Data['sensors']['adcSensors'];

export type PinKey = 'A/1' | 'A/2' | 'A/3' | 'A/4' | 'A/5' | 'A/6' | 'A/7';

export type Plant = {
  id: number;
  soilName: string;
  name: string;
  humiditySoil: string;
  waterOn: boolean;
  usehumiditySoil: boolean;
  soilSensor: SoilLabelList | null;
  usePump: boolean;
  pumpSensor: PinKey | null;
  startPump: number;
  stopPump: number;
};

export type Data = {
  generall: {
    temperature: {
      min: number;
      max: number;
      active: boolean;
      current: number;
      sensor?: null;
    };
    humidityAir: {
      min: number;
      max: number;
      active: boolean;
      current: number;
      sensor?: null;
    };
    light: {
      active: boolean;
      current: number;
      sensor: 'A/19';
    };
    pressure: {
      min: number;
      max: number;
      active: boolean;
      current: number;
      sensor?: null;
    };
    fan: {
      active: boolean;
      current: number;
      sensor?: PinKey | null;
    };
  };
  plantConfig: Plant[];
  sensors: {
    adcSensors: {
      'E/01': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/02': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/03': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/04': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/05': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/06': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/07': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/08': {
        address: string;
        channel: string;
        h_0_min: number;
        h_100_max: number;
        activeToId: number;
        active: boolean;
      };
      'E/09': {
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
