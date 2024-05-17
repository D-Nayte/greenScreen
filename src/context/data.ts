'use client';

import { create } from 'zustand';

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
    soilSensor: number | null;
    usePump: boolean;
    pumpSensor: number | null;
    startPump: number;
    stopPump: number;
  }[];
};

type SocketState = {
  data: Data | null;
  _setData: (data: Data) => void;
};

export const useData = create<SocketState>((set) => ({
  data: null,

  _setData: (receivedData) => {
    set(() => ({ data: receivedData }));
  },
}));
