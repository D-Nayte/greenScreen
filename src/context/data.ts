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
      sensor: number;
    };
    light: {
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
    id: string;
    soilName: string;
    name: string;
    humiditySoil: string;
    waterOn: string;
    usehumiditySoil: boolean;
  }[];
};

type SocketState = {
  data: Data | null;
  setData: (data: Data) => void;
};

export const useData = create<SocketState>((set) => ({
  data: null,

  setData: (receivedData) => {
    set(() => ({ data: receivedData }));
  },
}));
