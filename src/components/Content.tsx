import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConfigGlobal from './ConfigGlobal'
import OverviewGenerell from './OverviewGenerell'
import Plants from './Plants'
import { memo } from 'react'
import LogInfo from './LogInfo'

type ContentProps = {
    tabs: 'overview' | 'config' | 'infos'
}

const Content = ({ tabs }: ContentProps) => {
    return (
        <div className="overflow-hidden h-full">
            <Tabs defaultValue="overview" value={tabs} className="h-full">
                <TabsContent
                    value="overview"
                    className={`${
                        tabs === 'overview' && 'flex flex-col h-full'
                    }`}
                >
                    <OverviewGenerell />
                    <Plants />
                </TabsContent>

                <TabsContent
                    value="config"
                    className={`${tabs === 'config' && 'flex flex-col h-full'}`}
                >
                    <ConfigGlobal />
                </TabsContent>

                <TabsContent
                    value="infos"
                    className={`${tabs === 'infos' && 'flex flex-col h-full'}`}
                >
                    <LogInfo />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default memo(Content)
