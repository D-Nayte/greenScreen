import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GiGroupedDrops } from "react-icons/gi";
import { FaDroplet } from "react-icons/fa6";
import { Data } from "../../types/sensor";

type PlantCardProps = {
  plant: Data["plantConfig"][0];
};

const PlantCard = ({ plant }: PlantCardProps) => {
  const usehumiditySoil = plant.usehumiditySoil;
  const irrigating = plant.usehumiditySoil && plant.waterOn;

  return (
    <Card className=" min-h-[160px] h-full p-1 flex flex-col">
      <CardHeader className="p-2">
        <CardTitle className="text-center">{plant.name}</CardTitle>
        <CardDescription className="flex items-center justify-center ">
          <span className="flex gap-1 ">
            <GiGroupedDrops
              className={`${
                !usehumiditySoil ? "opacity-20" : "fill-blue"
              } text-lg`}
            />
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 flex flex-col items-start justify-start text-xs">
        <p>
          <span className=" font-semibold ">Soil:</span> {plant.soilName}
        </p>
        <p>
          <span className=" font-semibold ">Humidity:</span>
          {usehumiditySoil ? ` ${plant.humiditySoil}%` : "-"}
        </p>
        <p>
          <span className=" font-semibold ">Sensor:</span>
          {usehumiditySoil ? ` ${plant.soilSensor}` : "-"}
        </p>
      </CardContent>
      <CardFooter className="basis-full p-0 mt-1 flex items-end justify-end ">
        <div className="w-full flex justify-center ">
          <FaDroplet
            className={`${irrigating ? "drop animateDrop" : "drop opacity-20"}`}
          />
          <FaDroplet
            className={`${irrigating ? "drop animateDrop" : "drop opacity-20"}`}
          />
          <FaDroplet
            className={`${irrigating ? "drop animateDrop" : "drop opacity-20"}`}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlantCard;
