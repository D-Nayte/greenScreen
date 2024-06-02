import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ConfigTemplate from './ConfigTemplate';
import PlantConfig from './PlantConfig';
import { useData } from '@/context/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PiPlant } from 'react-icons/pi';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Data } from '../../types/sensor';
import { useShallow } from 'zustand/react/shallow';
import { memo } from 'react';

const ConfigGlobal = () => {
  const { data } = useData(
    useShallow((state) => ({ data: state.data })),
    () => false
  );
  const newPLant: Data['plantConfig'][number] = {
    id: data?.plantConfig?.length ? data?.plantConfig?.length + 1 : 0,
    name: 'New Plant',
    soilName: 'Soil',
    humiditySoil: '',
    waterOn: false,
    soilSensor: null,
    pumpSensor: null,
    usehumiditySoil: false,
    usePump: false,
    startPump: 0,
    stopPump: 1,
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="myPadding pb-2 max-h-[98%] h-full overflow-scroll">
      <section>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="hover:no-underline">Temperature</AccordionTrigger>
            <AccordionContent>
              <ConfigTemplate
                config="temperature"
                unit="°C"
                maxValue={data.generall.temperature.max}
                minValue={data.generall.temperature.min}
                min={0}
                max={60}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-2">
            <AccordionTrigger className="hover:no-underline">Humidity Air</AccordionTrigger>
            <AccordionContent>
              <ConfigTemplate
                config="humidityAir"
                unit="%"
                maxValue={data.generall.humidityAir.max}
                minValue={data.generall.humidityAir.min}
                min={0}
                max={100}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-3">
            <AccordionTrigger className="hover:no-underline">Light</AccordionTrigger>
            <AccordionContent>
              <ConfigTemplate config="light" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-4">
            <AccordionTrigger className="hover:no-underline">Fan</AccordionTrigger>
            <AccordionContent>
              <ConfigTemplate config="fan" hasSensor={true} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-5">
            <AccordionTrigger className="hover:no-underline">Plants</AccordionTrigger>
            <AccordionContent>
              <Tabs defaultValue="plants" className="w-full">
                <TabsList>
                  <TabsTrigger value="plants">
                    <PiPlant className=" text-xl fill-green-600" />
                  </TabsTrigger>
                  <TabsTrigger value="password">
                    <IoAddCircleOutline className=" text-xl fill-black" />
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="plants">
                  <ul>
                    {data.plantConfig.map((plant, index) => (
                      <li key={index}>
                        <Accordion type="single" collapsible className="ml-2  ">
                          <AccordionItem value="item-5" className=" border-b-0">
                            <AccordionTrigger className="hover:no-underline">
                              {plant.name}
                            </AccordionTrigger>
                            <AccordionContent className="ml-2">
                              <PlantConfig key={plant.id} plant={plant} id={plant.id} />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="password">
                  <ul>
                    <PlantConfig plant={newPLant} id={newPLant.id} noDelete />
                  </ul>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default memo(ConfigGlobal);
