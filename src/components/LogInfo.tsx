import { useSocket } from '@/context/sockets'
import React, { useEffect, useState } from 'react'

const LogInfo = () => {
    const { getLogs, socket } = useSocket()
    const [logs, setLogs] = useState('')

    console.log('logs :>> ', logs)

    useEffect(() => {
        getLogs()
        socket.on('sendLogs', (logs: string) => {
            setLogs(logs)
        })

        return () => {
            socket.off('sendLogs')
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
