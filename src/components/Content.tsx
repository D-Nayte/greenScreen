import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigGlobal from './ConfigGlobal';

type ContentProps = {
  tabs: 'overview' | 'config';
};

const Content = ({ tabs }: ContentProps) => {
  return (
    <Tabs defaultValue="overview" className="w-[400px]" value={tabs}>
      <TabsContent value="overview">Make changes to your account here.</TabsContent>

      <TabsContent value="config">
        <ConfigGlobal />
      </TabsContent>
    </Tabs>
  );
};

export default Content;
