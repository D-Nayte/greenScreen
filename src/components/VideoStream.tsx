'use client'

import { useEffect, useRef } from 'react'
import { useSocket } from '@/context/sockets'

interface HTMLVideoElementWithMediaSource extends HTMLVideoElement {
    mediaSource?: MediaSource
}

export default function VideoStream() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { socket } = useSocket()

    useEffect(() => {
        socket.emit('getVideoStream')

        var canvas = canvasRef.current
        if (canvas) {
            var context = canvas.getContext('2d')!

            socket.on('sendVideoStream', function (data) {
                var imageObj = new Image()
                imageObj.src = 'data:image/jpeg;base64,' + data
                imageObj.onload = function () {
                    const aspectRatio = imageObj.width / imageObj.height

                    // Set the canvas size based on the aspect ratio
                    canvas!.width = window.innerWidth
                    canvas!.height = window.innerWidth / aspectRatio
                    context.drawImage(
                        imageObj,
                        0,
                        0,
                        canvas!.width,
                        canvas!.height
                    )
                }
            })
        }

        return () => {
            socket.off('sendVideoStream')
            socket.close()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            <h1>Live Stream</h1>
            <canvas id="canvas" ref={canvasRef} className="w-full h-[600]" />
        </div>
    )
}
