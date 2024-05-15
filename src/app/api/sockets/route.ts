import { NextResponse } from 'next/server';
import { io } from 'socket.io-client';
// const PORT = process.env.WEBSOCKET_PORT || 5555;
const PORT = process.env.WEBSOCKET_PORT || 3000;
const socket = io(`http://localhost:${PORT}`);

export async function POST() {
  try {
    // do something you need to do in the backend
    // (like database operations, etc.)

    socket.emit('message', 'Sync Process Completed');

    return NextResponse.json({ data: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error }, { status: 200 });
  }
}
