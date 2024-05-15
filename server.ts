import express from 'express';
import next from 'next';
import http from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import fs from 'fs';
import { Data } from '@/context/data';
config();

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  sendAlltestMessage: (data: string) => void;
  sendData: (data: any) => void;
}

export interface ClientToServerEvents {
  message: (data: string) => void;
  getData: () => void;
  setData: (data: Data) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
// const PORT = process.env.WEBSOCKET_PORT || 5555;
const PORT = process.env.WEBSOCKET_PORT || 3000;

const readData = () => {
  const data = fs.readFileSync('./data/config.json', 'utf8');
  return JSON.parse(data) as Data;
};

const writeData = (data: Data) => {
  fs.writeFileSync('./data/config.json', JSON.stringify(data, null, 2), 'utf8');
  const newData = readData();
  return newData;
};

app.prepare().then(async () => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: '*',
      },
    }
  );

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (data) => {
      io.emit('sendAlltestMessage', data);
    });

    socket.on('setData', (data: Data) => {
      const newData = writeData(data);

      io.emit('sendData', newData);
    });

    socket.on('getData', () => {
      const data = readData();
      io.emit('sendData', data);
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
