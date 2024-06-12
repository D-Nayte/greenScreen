'use client'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HomeIcon, VideoIcon, GearIcon, BellIcon } from '@radix-ui/react-icons'

type NavbarProps = {
    settabs: Dispatch<
        SetStateAction<'overview' | 'config' | 'infos' | 'stream'>
    >
}

type ContentMap = {
    overview: string | JSX.Element
    stream: string | JSX.Element
    config: string | JSX.Element
    infos: string | JSX.Element
}

const Navbar = ({ settabs }: NavbarProps) => {
    const [contentMap, setContentMap] = useState<ContentMap>({
        overview: 'Overview',
        stream: 'Video Stream',
        config: 'Config',
        infos: 'Infos',
    })

    const handleResize = () => {
        const maxScreenWidth =
            typeof window !== 'undefined' ? window.innerWidth : 0
        const isSmallScreen = maxScreenWidth < 540

        setContentMap((prev) => {
            if (isSmallScreen) {
                prev.overview = <HomeIcon />
                prev.stream = <VideoIcon />
                prev.config = <GearIcon />
                prev.infos = <BellIcon />
            } else {
                prev.overview = 'Overview'
                prev.stream = 'Video Stream'
                prev.config = 'Config'
                prev.infos = 'Infos'
            }
            return { ...prev }
        })
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            handleResize()
            window.addEventListener('resize', handleResize)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize)
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="bg-primary-green w-full myPadding flex justify-between items-center flex-wrap">
            <h1 className="text-primary-foreground font-semibold tracking-wider text-lg">
                GreenScreen
            </h1>

            <Tabs
                defaultValue="overview"
                className={`ml-auto border-slate-700"`}
            >
                <TabsList className="flex flex-wrap">
                    <TabsTrigger
                        value="overview"
                        onClick={(val) => settabs('overview')}
                    >
                        {contentMap.overview}
                    </TabsTrigger>
                    <TabsTrigger
                        value="stream"
                        onClick={(val) => settabs('stream')}
                    >
                        {contentMap.stream}
                    </TabsTrigger>
                    <TabsTrigger
                        value="config"
                        onClick={(val) => settabs('config')}
                    >
                        {contentMap.config}
                    </TabsTrigger>
                    <TabsTrigger
                        value="infos"
                        onClick={(val) => settabs('infos')}
                    >
                        {contentMap.infos}
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}

export default Navbar
