'use client'

import { useData } from '@/context/data'
import { useSocket } from '@/context/sockets'
import { ReactNode, useEffect } from 'react'

const WebSocketWrapper = ({ children }: { children: ReactNode }) => {
    const { socket } = useSocket()
    const { _setData } = useData()

    useEffect(() => {
        socket.on('sendData', (data) => {
            _setData(data)
        })

        return () => {
            socket.off('sendData')
        }

        // eslint-disable-next-line
    }, [socket])

    return <>{children}</>
}

export default WebSocketWrapper
