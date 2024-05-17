import { useData } from '@/context/data';
import PlantCard from './PlantCard';

const Plants = () => {
  const { data } = useData();
  const { plantConfig } = data || {};

  return (
    <ul className="max-h-[100%] flex flex-row justify-around flex-wrap gap-4 overflow-scroll pb-5 ">
      {plantConfig?.map((plant, index) => {
        return (
          <li key={index} className="w-[130px]">
            <PlantCard plant={plant} />
          </li>
        );
      })}
    </ul>
  );
};

export default Plants;
