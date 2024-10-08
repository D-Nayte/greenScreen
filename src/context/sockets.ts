'use client'

import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '../../server'
import { Data } from '../../types/sensor'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    `/`,
    { transports: ['websocket'] }
)

type SocketState = {
    message: string | null
    socket: typeof socket
    sendMessage: (message: string) => void
    setData: (data: Data) => void
    getLogs: () => void
}

export const useSocket = create<SocketState>((set) => ({
    message: null,
    socket,

    sendMessage: (message: string) => {
        socket.emit('message', message)
        return
    },
    setData: (data) => {
        socket.emit('setData', data)
        return
    },
    getLogs: () => {
        socket.emit('getLogs')
        return
    },
}))
