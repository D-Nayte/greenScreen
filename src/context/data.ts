"use client";

import { create } from "zustand";
import { Data } from "../../types/sensor";

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
