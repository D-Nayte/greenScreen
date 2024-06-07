import { Slider } from '@/components/ui/slider'
import { useMemo, useState } from 'react'
import { useSocket } from '@/context/sockets'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import SelectSensor from './SelectSensor'
import { useData } from '@/context/data'
import { Data, PinKey } from '../../types/sensor'

type GenerellConfigKeys = 'temperature' | 'humidityAir' | 'light' | 'fan'
type TempHumidity = 'temperature' | 'humidityAir'

type ConfigTemplateProps<T extends GenerellConfigKeys> = T extends TempHumidity
    ? {
          unit: string
          config: T
          minValue: number
          maxValue: number
          min: number
          max: number
          hasSensor?: undefined
      }
    : {
          unit?: undefined
          config: T
          minValue?: undefined
          maxValue?: undefined
          min?: undefined
          max?: undefined
          hasSensor?: boolean
      }

const ConfigTemplate = <T extends GenerellConfigKeys>({
    unit,
    minValue,
    maxValue,
    config,
    min,
    max,
    hasSensor = false,
}: ConfigTemplateProps<T>) => {
    const { setData } = useSocket()
    const { data } = useData()
    const dataCopy = useMemo(() => ({ ...data }), [data]) as Data
    const hasMinMaxConfigs =
        config === 'temperature' || config === 'humidityAir'
    const [value, setValue] = useState(
        hasMinMaxConfigs
            ? {
                  min: data?.generall[config].min || 30,
                  max: data?.generall[config].max || 30,
              }
            : {}
    )

    const handleTempChange = (
        temp: number,
        key: 'min' | 'max',
        unit: TempHumidity
    ) => {
        if (!dataCopy.generall) return
        setValue((prev) => ({ ...prev, [key]: temp }))

        if (key === 'min' && value?.min && temp > value.max) {
            setValue(() => ({ max: temp + 1, ['min']: temp }))
            dataCopy.generall[unit]['max'] = temp + 1
        }
        if (key === 'max' && value?.max && temp < value.min) {
            setValue(() => ({ min: temp - 1, ['max']: temp }))
            dataCopy.generall[unit]['min'] = temp - 1
        }

        dataCopy.generall[unit][key] = temp

        setData(dataCopy)
    }

    const activateDisable = (field: GenerellConfigKeys) => {
        if (!dataCopy.generall) return

        dataCopy.generall[field].active = !dataCopy.generall[field].active

        if (!dataCopy.generall[field].active) {
            if (field === 'fan') dataCopy.generall['fan'].sensor = null
        }

        setData(dataCopy)
    }

    const handleSensorChange = (sensor: PinKey, field: 'fan') => {
        if (!dataCopy.generall && !hasSensor) return

        dataCopy.generall[field].sensor = sensor

        setData(dataCopy)
    }

    if (!data) return null

    return (
        <div className="flex flex-col gap-2 pt-1" style={{ zIndex: '10' }}>
            {hasMinMaxConfigs && (
                <>
                    <div className="flex ">
                        <p
                            className={`mr-12 basis-32 ${
                                !data.generall[config].active && 'text-gray-400'
                            }`}
                        >
                            min {value.min} {unit}
                        </p>
                        <Slider
                            defaultValue={[minValue]}
                            max={max}
                            min={min}
                            step={1}
                            disabled={!data.generall[config].active}
                            value={[minValue]}
                            onValueChange={(e) =>
                                handleTempChange(e[0], 'min', config)
                            }
                        />
                    </div>
                    <div className="flex">
                        <p
                            className={`mr-12 basis-32 ${
                                !data.generall[config].active && 'text-gray-400'
                            }`}
                        >
                            max {value.max} {unit}
                        </p>
                        <Slider
                            defaultValue={[maxValue]}
                            max={max}
                            min={min}
                            step={1}
                            disabled={!data.generall[config].active}
                            value={[maxValue]}
                            onValueChange={(e) =>
                                handleTempChange(e[0], 'max', config)
                            }
                        />
                    </div>
                </>
            )}

            <div className="flex items-center space-x-2 mt-1 justify-between">
                <div className="flex items-center gap-1">
                    <Label htmlFor="temp">
                        {data.generall[config].active
                            ? 'Activated'
                            : 'Disabled'}
                    </Label>
                    <Switch
                        id="temp"
                        checked={data.generall[config].active}
                        onCheckedChange={(e) =>
                            data.generall && activateDisable(config)
                        }
                    />
                </div>
                {hasSensor && config === 'fan' && data?.generall && (
                    <div className="flex items-center gap-1 ">
                        <SelectSensor
                            value={
                                data?.generall['fan']!.sensor?.toString() || ''
                            }
                            onSenorChange={(value) =>
                                handleSensorChange(value as PinKey, 'fan')
                            }
                            unit={'pump'}
                            disabled={!data.generall[config].active}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ConfigTemplate
