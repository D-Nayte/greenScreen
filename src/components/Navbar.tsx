import React, { Dispatch, SetStateAction } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type NavbarProps = {
    settabs: Dispatch<
        SetStateAction<'overview' | 'config' | 'infos' | 'stream'>
    >
}

const Navbar = ({ settabs }: NavbarProps) => {
    return (
        <div className="bg-primary-green w-full myPadding flex justify-between items-center">
            <h1 className="text-primary-foreground font-semibold tracking-wider">
                GreenScreen
            </h1>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger
                        value="overview"
                        onClick={(val) => settabs('overview')}
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="stream"
                        onClick={(val) => settabs('stream')}
                    >
                        Video Stream
                    </TabsTrigger>
                    <TabsTrigger
                        value="config"
                        onClick={(val) => settabs('config')}
                    >
                        Config
                    </TabsTrigger>
                    <TabsTrigger
                        value="infos"
                        onClick={(val) => settabs('infos')}
                    >
                        Infos
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}

export default Navbar
