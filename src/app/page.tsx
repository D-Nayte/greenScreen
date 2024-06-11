'use client'
import Navbar from '@/components/Navbar'
import { useState } from 'react'
import Content from '@/components/Content'

export default function Home() {
    const [tabs, settabs] = useState<
        'overview' | 'config' | 'infos' | 'stream'
    >('overview')
    return (
        <main className="flex flex-col w-full max-h-[100svh]">
            <Navbar settabs={settabs} />
            <Content tabs={tabs} />
        </main>
    )
}
