'use client';

import { useData } from '@/context/data';
import { useSocket } from '@/context/sockets';
import { ReactNode, useEffect } from 'react';

const WebSocketWrapper = ({ children }: { children: ReactNode }) => {
  const { _receiveMessage, socket } = useSocket();
  const { _setData } = useData();

  useEffect(() => {
    socket.on('sendAlltestMessage', (data) => {
      console.log('Recieved from SERVER ::', data);
      // Execute any command
      _receiveMessage(data);
    });

    socket.on('sendData', (data) => {
      _setData(data);
    });

    // eslint-disable-next-line

    return () => {
      socket.off('sendAlltestMessage');
      socket.off('sendData');
    };

    // eslint-disable-next-line
  }, [socket]);

  useEffect(() => {
    socket.emit('getData');

    // eslint-disable-next-line
  }, []);

  return <>{children}</>;
};

export default WebSocketWrapper;
