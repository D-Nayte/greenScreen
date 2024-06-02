import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useData } from '@/context/data'
import { pinList } from '../../utils/constant'
import { PinKey, SoilLabelList } from '../../types/sensor'
import e from 'express'
import { useState } from 'react'

type Props = {
    value: string | null | undefined
    onSenorChange: (value: SoilLabelList | PinKey) => void
    disabled?: boolean
    withLabel?: boolean
    unit: 'soil' | 'pump'
}

const SelectSensor = ({
    value,
    onSenorChange,
    disabled,
    unit,
    withLabel = true,
}: Props) => {
    const { data } = useData()
    const humiditySensors = Object.keys(
        data?.sensors.adcSensors || {}
    ) as SoilLabelList[]
    const pumpOutgoings = Object.keys(pinList) as PinKey[]
    const usedHumiditySensors = (data?.plantConfig || [])
        .map((item) => item.usehumiditySoil && item.soilSensor)
        .filter((item) => item) as string[]

    const usedPumpOutgoings = (data?.plantConfig || [])
        .map((item) => item.usePump && item.pumpSensor)
        .filter((item) => item) as string[]
    const usedList = unit === 'soil' ? usedHumiditySensors : usedPumpOutgoings
    const selectList = unit === 'soil' ? humiditySensors : pumpOutgoings
    const [open, setopen] = useState(false)

    return (
        <div>
            {withLabel && <Label htmlFor="sensor">Sensor</Label>}
            <Select value={value || ''} open={open}>
                <SelectTrigger
                    id="sensor"
                    className="w-[150px]"
                    disabled={disabled}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setopen(true)
                    }}
                >
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                    {selectList.map((label, index) => (
                        <SelectItem
                            key={index}
                            value={label}
                            disabled={usedList.includes(label)}
                            onClick={() => {
                                setopen(false)
                                onSenorChange(label)
                            }}
                        >
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export default SelectSensor
