'use client';
import Navbar from '@/components/Navbar';
import { useSocket } from '@/context/sockets';
import { useState } from 'react';
import Content from '@/components/Content';

export default function Home() {
  const { sendMessage, message } = useSocket();

  const [tabs, settabs] = useState<'overview' | 'config'>('overview');

  console.log('message :>> ', message);
  return (
    <main>
      <Navbar settabs={settabs} />
      <Content tabs={tabs} />
    </main>
  );
}
