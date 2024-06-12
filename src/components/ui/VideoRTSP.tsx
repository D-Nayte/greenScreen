'use client'

import { useEffect, useState } from 'react'

const VideoRTSP = () => {
    const [url, setUrl] = useState<URL | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const streamUrl = new URL(window.location.href)
            streamUrl.port = '8889'
            setUrl(streamUrl)
        }
    }, [])

    return (
        <>
            {url ? (
                <iframe
                    src={url.href}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                ></iframe>
            ) : null}
        </>
    )
}

export default VideoRTSP
