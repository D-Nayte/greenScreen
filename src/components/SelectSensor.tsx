import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useData } from "@/context/data";
import { pinList } from "../../sensor/gipo";

type Props = {
  value: string | null | undefined;
  onSenorChange: (value: string) => void;
  disabled?: boolean;
  withLabel?: boolean;
};

const SelectSensor = ({
  value,
  onSenorChange,
  disabled,
  withLabel = true,
}: Props) => {
  const { data } = useData();
  const generallSensors = Object.values(data?.generall || {})
    .map((item) => item.active && item?.sensor && item.sensor)
    .filter((item) => item);
  const plantsSensor = data?.plantConfig
    ? data.plantConfig
        .map((item) => item.usehumiditySoil && item.soilSensor)
        .filter((item) => item)
    : [];
  const usedSensors = [...generallSensors, ...plantsSensor].filter(
    (item) => item
  ) as string[];
  const sensors = Object.keys(pinList);
  const sensorTotal = sensors.length;

  return (
    <>
      {withLabel && <Label htmlFor="sensor">Sensor</Label>}
      <Select onValueChange={onSenorChange} value={value || ""}>
        <SelectTrigger id="sensor" className="w-[150px]" disabled={disabled}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          {sensors.map((label, index) => (
            <SelectItem
              key={index}
              value={label}
              disabled={value ? usedSensors.includes(value) : false}>
              {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectSensor;
