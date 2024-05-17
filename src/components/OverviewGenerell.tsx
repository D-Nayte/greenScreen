import { BsFan } from 'react-icons/bs';
import { CiTempHigh } from 'react-icons/ci';
import { WiHumidity } from 'react-icons/wi';
import { CiSun } from 'react-icons/ci';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { useData } from '@/context/data';

const OverviewGenerell = () => {
  const { data } = useData();
  const fan = {
    on: data?.generall.fan.current === 1,
    active: data?.generall.fan.active,
  };
  const temp = {
    current: data?.generall.temperature.current,
    active: data?.generall.temperature.active,
  };
  const humidityAir = {
    current: data?.generall.humidityAir.current,
    active: data?.generall.humidityAir.active,
  };

  const light = {
    current: data?.generall.light.current,
    active: data?.generall.light.active,
  };

  const showFan = fan.active ? (
    <p className="flex items-center gap-1">
      <BsFan className={`fan ${fan.on && 'active'}`} />
      <Label htmlFor="temp">{fan.on ? 'running' : 'standby'}</Label>
    </p>
  ) : (
    <p className="flex items-center gap-1 opacity-50">
      <BsFan className="text-gray-500" />
      <Label>off</Label>
    </p>
  );

  const showhumidityAir = humidityAir.active ? (
    <p className="flex items-center gap-0">
      <WiHumidity className="humidityAir" />
      <Label htmlFor="temp">{humidityAir.current} %</Label>
    </p>
  ) : (
    <p className="flex items-center gap-0 opacity-50">
      <WiHumidity className="humidityAir text-gray-500 " />
      <Label>off</Label>
    </p>
  );

  const showTemp = temp.active ? (
    <p className="flex items-center gap-0">
      <CiTempHigh className="temp" />
      <Label htmlFor="temp">{temp.current} °C</Label>
    </p>
  ) : (
    <p className="flex items-center gap-0 opacity-50">
      <CiTempHigh className="temp text-gray-500 " />
      <Label>off</Label>
    </p>
  );

  const showLight = light.active ? (
    <p className="flex items-center gap-0">
      <CiSun className="light" />
      <Label htmlFor="temp">{light.current} Lux</Label>
    </p>
  ) : (
    <p className="flex items-center gap-0 opacity-50">
      <CiSun className="light text-gray-500 " />
      <Label>off</Label>
    </p>
  );

  return (
    <div className="myPadding">
      <Card>
        <CardContent className="flex justify-evenly p-2">
          {showFan}
          {showTemp}
          {showhumidityAir}
          {showLight}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewGenerell;
