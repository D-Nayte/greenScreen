import { useSocket } from '@/context/sockets'
import React, { useEffect, useState } from 'react'

const LogInfo = () => {
    const { getLogs, socket } = useSocket()
    const [logs, setLogs] = useState('')

    console.log('logs :>> ', logs)

    useEffect(() => {
        socket.on('sendLogs', (logs: string) => {
            setLogs(logs)
        })

        const inertvallId = setInterval(() => {
            getLogs()
        }, 1000)

        return () => {
            socket.off('sendLogs')
            clearInterval(inertvallId)
        }

        // eslint-disable-next-line
    }, [])

    const preStyle = {
        backgroundColor: '#f4f4f4',
        padding: '10px',
        borderRadius: '5px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap', // This helps to wrap long lines
    }

    return <pre style={preStyle}>{logs}</pre>
}

export default LogInfo
