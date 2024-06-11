//@ts-nocheck
'use client'

import { useEffect, useRef } from 'react'
import { useSocket } from '@/context/sockets'

interface HTMLVideoElementWithMediaSource extends HTMLVideoElement {
    mediaSource?: MediaSource
}

export default function VideoStream() {
    const videoRef = useRef<HTMLCanvasElement>(null)
    const { socket } = useSocket()

    useEffect(() => {
        socket.emit('getVideoStream')

        var canvas = videoRef.current
        if (canvas) {
            var context = canvas.getContext('2d')!

            socket.on('sendVideoStream', function (data) {
                var imageObj = new Image()
                imageObj.src = 'data:image/jpeg;base64,' + data
                imageObj.onload = function () {
                    context.height = videoRef.current!.height
                    context.width = videoRef.current!.width
                    context.drawImage(
                        imageObj,
                        0,
                        0,
                        context.width,
                        context.height
                    )
                }
            })
        }

        return () => {
            socket.off('sendVideoStream')
            socket.close()
        }
    }, [])

    return (
        <div>
            <h1>Live Stream</h1>
            {/* <video ref={videoRef} controls autoPlay /> */}
            <canvas id="canvas" ref={videoRef} className="w-full h-[600]" />
        </div>
    )
}
