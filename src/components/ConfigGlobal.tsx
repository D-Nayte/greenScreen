import { Data, useData } from '@/context/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { useEffect, useMemo, useState } from 'react';
import { useSocket } from '@/context/sockets';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type GenerellConfigKeys = 'temperature' | 'humidityAir' | 'light' | 'fan';

const ConfigGlobal = () => {
  const { data } = useData();
  const { setData } = useSocket();
  const sensorTotal = 18;
  const dataCopy = useMemo(() => ({ ...data }), [data]) as Data;
  const [temp, setTemp] = useState({
    min: data?.generall.temperature.min || 30,
    max: data?.generall.temperature.max || 30,
  });
  const usedSensors = Object.values(data?.generall || {}).map((item) => item?.sensor);
  console.log('usedSensors :>> ', usedSensors);
  const handleTempChange = (temp: number, key: 'min' | 'max') => {
    if (!dataCopy.generall) return;
    setTemp((prev) => ({ ...prev, [key]: temp }));

    dataCopy.generall.temperature[key] = temp;

    setData(dataCopy);
  };

  const activateDisable = (field: GenerellConfigKeys) => {
    if (!dataCopy.generall) return;

    dataCopy.generall[field].active = !dataCopy.generall[field].active;

    setData(dataCopy);
  };

  const handleSensorChange = (sensor: number, field: GenerellConfigKeys) => {
    if (!dataCopy.generall) return;

    dataCopy.generall[field].sensor = sensor;

    setData(dataCopy);
  };

  useEffect(() => {
    if (
      (data?.generall.temperature.min !== temp.min || data.generall.temperature.max !== temp.max) &&
      data
    ) {
      setTemp({
        min: data.generall.temperature.min,
        max: data.generall.temperature.max,
      });
    }

    // eslint-disable-next-line
  }, [data]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="myPadding">
      <section>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="hover:no-underline"> Temperature </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex ">
                  <p
                    className={`mr-12 basis-32 ${
                      !data.generall.temperature.active && 'text-gray-400'
                    }`}
                  >
                    min {temp.min}°C{' '}
                  </p>
                  <Slider
                    defaultValue={[temp.min]}
                    max={40}
                    min={10}
                    step={1}
                    disabled={!data.generall.temperature.active}
                    value={[temp.min]}
                    onValueChange={(e) => handleTempChange(e[0], 'min')}
                  />
                </div>
                <div className="flex">
                  <p
                    className={`mr-12 basis-32 ${
                      !data.generall.temperature.active && 'text-gray-400'
                    }`}
                  >
                    max {temp.max}°C{' '}
                  </p>
                  <Slider
                    defaultValue={[temp.max]}
                    max={40}
                    min={10}
                    step={1}
                    disabled={!data.generall.temperature.active}
                    value={[temp.max]}
                    onValueChange={(e) => handleTempChange(e[0], 'max')}
                  />
                </div>

                <div className="flex items-center space-x-2 mt-1 justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="temp">
                      {data.generall.temperature.active ? 'Activated' : 'Disabled'}
                    </Label>
                    <Switch
                      id="temp"
                      checked={data.generall.temperature.active}
                      onCheckedChange={(e) => dataCopy.generall && activateDisable('temperature')}
                    />
                  </div>

                  <div className="flex items-center gap-1 ">
                    <Label htmlFor="sensor">Sensor</Label>
                    <Select
                      onValueChange={(value) => handleSensorChange(parseInt(value), 'temperature')}
                      value={data.generall.temperature.sensor.toString()}
                    >
                      <SelectTrigger
                        id="sensor"
                        className="w-[150px]"
                        disabled={!data.generall.temperature.active}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: sensorTotal }).map((_, index) => (
                          <SelectItem
                            key={index}
                            value={`${index}`}
                            disabled={usedSensors.includes(index)}
                          >
                            {index}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default ConfigGlobal;
