'use client'

import { createWithEqualityFn } from 'zustand/traditional'
import { SoilLabelList } from '../../types/sensor'

type SocketState = {
    dialogOpen: boolean
    sensor: SoilLabelList | null
    openCalibrateDialog: (open: boolean, sensor: SoilLabelList) => void
    closeCalibrateDialog: () => void
}

export const useCalibrateSoil = createWithEqualityFn<SocketState>((set) => ({
    dialogOpen: false,
    sensor: null,

    openCalibrateDialog: (open, sensor) => {
        set(() => ({ dialogOpen: open, sensor }))
    },
    closeCalibrateDialog: () => {
        set(() => ({ dialogOpen: false, sensor: null }))
    },
}))
