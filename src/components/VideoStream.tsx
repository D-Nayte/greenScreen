import { useSocket } from '@/context/sockets'
import { useEffect, useRef } from 'react'

export default function VideoStream() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const { socket } = useSocket()

    useEffect(() => {
        socket.emit('getVideoStream')

        socket.on('sendVideoStream', (event) => {
            console.log('event :>> ', event)
            const video = videoRef.current
            const blob = new Blob([event], { type: 'video/mp2t' })
            const url = URL.createObjectURL(blob)

            if (video) {
                video.src = url
                video?.play()
            }
        })

        return () => {
            socket.off('sendVideoStream')
            socket.close()
        }

        // eslint-disable-next-line
    }, [])

    return (
        <div>
            <h1>Live Stream</h1>
            <video ref={videoRef} controls />
        </div>
    )
}
