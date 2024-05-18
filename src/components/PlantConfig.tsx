import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TiDelete } from 'react-icons/ti';
import { Switch } from './ui/switch';
import SelectSensor from './SelectSensor';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from './ui/slider';
import { useSocket } from '@/context/sockets';
import { Data, useData } from '@/context/data';
import { FcCheckmark } from 'react-icons/fc';

type Props = {
  plant: Data['plantConfig'][0];
  id: Data['plantConfig'][0]['id'];
  noDelete?: boolean;
};

console.log('process.env.NODE :>> ', process.env.NODE_ENV);

const PlantConfig = ({ plant, id, noDelete = false }: Props) => {
  const [plantCopy, setplantCopy] = useState(JSON.parse(JSON.stringify(plant)));
  const [hasChanged, sethasChanged] = useState(false);
  const { setData } = useSocket();
  const { data } = useData();

  const handleSensorChange = (value: number, sensor: 'soilSensor' | 'pumpSensor') => {
    plantCopy[sensor] = value;
    setplantCopy(() => ({ ...plantCopy }));
  };

  const handActivateDisable = (val: boolean, sensor: 'usehumiditySoil' | 'usePump') => {
    plantCopy[sensor] = val;

    setplantCopy(() => ({ ...plantCopy }));
  };

  const handlePumpStartStopChange = (value: number, startStop: 'startPump' | 'stopPump') => {
    let newValue = value;

    if (startStop === 'stopPump' && value <= plantCopy.startPump) {
      plantCopy.startPump = value - 1;
    }

    if (startStop === 'startPump' && value >= plantCopy.stopPump) {
      plantCopy.stopPump = value + 1;
    }

    plantCopy[startStop] = newValue;
    setplantCopy(() => ({ ...plantCopy }));
  };

  const handleSave = (id: number) => {
    if (!data) return;

    const oldPlantIndex = data.plantConfig.findIndex((plant) => plant.id === id);

    if (oldPlantIndex !== -1) {
      data.plantConfig[oldPlantIndex] = plantCopy;
      setData(data);
    } else {
      setData({ ...data, plantConfig: [...data.plantConfig, plantCopy] });
    }

    sethasChanged(false);
  };

  const handleResett = () => {
    setplantCopy(() => ({ ...plant }));
    sethasChanged(false);
  };

  const handleInpitChange = (value: string, key: 'soilName' | 'name') => {
    plantCopy[key] = value;
    setplantCopy(() => ({ ...plantCopy }));
  };

  const deletePlant = (id: number) => {
    if (!data) return;

    const newPlantConfig = data.plantConfig.filter((plant) => plant.id !== id);

    setData({ ...data, plantConfig: newPlantConfig });
  };

  useEffect(() => {
    if (JSON.stringify(plant) !== JSON.stringify(plantCopy)) {
      setplantCopy(() => ({ ...plant }));
      sethasChanged(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plant]);

  useEffect(() => {
    sethasChanged(JSON.stringify(plant) !== JSON.stringify(plantCopy));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantCopy]);

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center justify-end gap-4 w-full">
        <Label className=" basis-14">Label</Label>
        <Input
          type="text"
          placeholder="Plant"
          defaultValue={plantCopy.name}
          onChange={(e) => handleInpitChange(e.target.value, 'name')}
        />
      </div>

      <div className="flex items-center gap-4 w-full">
        <Label className=" basis-14">Soil</Label>
        <Input
          type="text"
          placeholder="Soil"
          defaultValue={plantCopy.soilName}
          onChange={(e) => handleInpitChange(e.target.value, 'soilName')}
        />
      </div>

      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex items-center gap-0 basis-30">
          <Label className=" basis-14">Soil Sensor</Label>

          <Switch
            id="soil-sensor"
            defaultChecked={plantCopy.usehumiditySoil}
            checked={plantCopy.usehumiditySoil}
            onCheckedChange={(val) => handActivateDisable(val, 'usehumiditySoil')}
          />
        </div>
        <SelectSensor
          value={plantCopy.soilSensor?.toString()}
          onSenorChange={(value) => handleSensorChange(parseInt(value), 'soilSensor')}
          disabled={!plantCopy.usehumiditySoil}
          withLabel={false}
        />
      </div>
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex items-center gap-0 basis-50">
          <Label className=" basis-14">Pump Sensor</Label>

          <Switch
            id="pump-sensor"
            defaultChecked={plantCopy.usehumiditySoil ? plantCopy.usePump : false}
            checked={plantCopy.usehumiditySoil ? plantCopy.usePump : false}
            onCheckedChange={(val) => handActivateDisable(val, 'usePump')}
            disabled={!plantCopy.usehumiditySoil}
          />
        </div>

        <SelectSensor
          value={plantCopy.pumpSensor?.toString()}
          onSenorChange={(value) => handleSensorChange(parseInt(value), 'pumpSensor')}
          disabled={!plantCopy.usehumiditySoil || !plantCopy.usePump}
          withLabel={false}
        />
      </div>

      <div className="flex w-full ">
        <p
          className={`mr-12 basis-32 ${
            (!plantCopy.usePump || !plantCopy.usehumiditySoil) && 'text-gray-400'
          }`}
        >
          start {plantCopy.startPump}%
        </p>
        <Slider
          defaultValue={[plantCopy.startPump]}
          max={100}
          min={1}
          step={1}
          value={[plantCopy.startPump]}
          disabled={!plantCopy.usePump || !plantCopy.usehumiditySoil}
          onValueChange={(e) => handlePumpStartStopChange(e[0], 'startPump')}
        />
      </div>

      <div className="flex w-full">
        <p
          className={`mr-12 basis-32 ${
            (!plantCopy.usePump || !plantCopy.usehumiditySoil) && 'text-gray-400'
          }`}
        >
          stop {plantCopy.stopPump}%
        </p>
        <Slider
          defaultValue={[plantCopy.stopPump]}
          max={100}
          min={1}
          minStepsBetweenThumbs={5}
          step={1}
          value={[plantCopy.stopPump]}
          disabled={!plantCopy.usePump || !plantCopy.usehumiditySoil}
          onValueChange={(e) => handlePumpStartStopChange(e[0], 'stopPump')}
        />
      </div>

      <div className="flex items-center justify-between w-full mt-1">
        <Button
          variant="outline"
          className="p-1 h-fit pl-3 pr-3"
          disabled={!hasChanged}
          onClick={() => handleSave(id)}
        >
          Save
        </Button>
        <Button
          variant={!hasChanged ? 'outline' : 'destructive'}
          className={`p-1 h-fit pl-3 pr-3 ${hasChanged && 'bg-red-200'} text-black`}
          disabled={!hasChanged}
          onClick={handleResett}
        >
          Resett
        </Button>
      </div>

      {!noDelete && (
        <div className="flex justify-center w-full mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant={'destructive'} className="p-1 h-fit bg-red-400 pl-3 pr-3">
                Delete
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sure Delete?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex justify-between">
                <DropdownMenuItem>
                  <FcCheckmark
                    className="text-[30px] cursor-pointer"
                    onClick={() => deletePlant(plant.id)}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TiDelete className="text-[30px] fill-red-200 cursor-pointer" />
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default PlantConfig;
