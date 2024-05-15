'use client';

import { useData } from '@/context/data';
import { useSocket } from '@/context/sockets';
import { ReactNode, useEffect } from 'react';

const WebSocketWrapper = ({ children }: { children: ReactNode }) => {
  const { _receiveMessage, socket } = useSocket();
  const { data, setData } = useData();

  useEffect(() => {
    socket.on('sendAlltestMessage', (data) => {
      console.log('Recieved from SERVER ::', data);
      // Execute any command
      _receiveMessage(data);
    });

    socket.on('sendData', (data) => {
      console.log('Recieved DATA! ::', data);

      setData(data);
    });

    console.log('socket :>> ', socket);

    // eslint-disable-next-line
  }, [socket]);

  useEffect(() => {
    socket.emit('getData');

    // eslint-disable-next-line
  }, []);

  return <>{children}</>;
};

export default WebSocketWrapper;
