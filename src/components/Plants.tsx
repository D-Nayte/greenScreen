import { useData } from '@/context/data';
import PlantCard from './PlantCard';
import { useEffect } from 'react';
import { useSocket } from '@/context/sockets';

const Plants = () => {
  const { data } = useData();
  const { plantConfig } = data || {};
  const { socket } = useSocket();

  useEffect(() => {
    const intervallid = setInterval(() => {
      socket.emit('getData');
    }, 1000);

    return () => {
      clearInterval(intervallid);
    };

    // eslint-disable-next-line
  }, []);

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
