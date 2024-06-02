'use client';

import { create } from 'zustand';
import { Data } from '../../types/sensor';
import { createWithEqualityFn } from 'zustand/traditional';

type SocketState = {
  data: Data | null;
  _setData: (data: Data) => void;
};

export const useData = createWithEqualityFn<SocketState>((set) => ({
  data: null,

  _setData: (receivedData) => {
    set(() => ({ data: receivedData }));
  },
}));
