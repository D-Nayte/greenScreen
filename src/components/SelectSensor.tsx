import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/data';

type Props = {
  value: string | null | undefined;
  onSenorChange: (value: string) => void;
  disabled?: boolean;
  withLabel?: boolean;
};

const SelectSensor = ({ value, onSenorChange, disabled, withLabel = true }: Props) => {
  const { data } = useData();
  const generallSensors = Object.values(data?.generall || {}).map(
    (item) => item.active && item?.sensor
  );
  const plantsSensor = data?.plantConfig
    ? data.plantConfig.map((item) => item.usehumiditySoil && item.soilSensor)
    : [];
  const usedSensors = [...generallSensors, ...plantsSensor].filter((item) => item !== undefined);
  const sensorTotal = 18;

  return (
    <>
      {withLabel && <Label htmlFor="sensor">Sensor</Label>}
      <Select onValueChange={onSenorChange} value={value || ''}>
        <SelectTrigger id="sensor" className="w-[150px]" disabled={disabled}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {Array.from({ length: sensorTotal }).map((_, index) => (
            <SelectItem
              key={index}
              value={`${index + 1}`}
              disabled={usedSensors.includes(index + 1)}
            >
              {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectSensor;
