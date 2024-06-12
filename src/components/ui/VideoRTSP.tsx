import axios from 'axios'

const VideoRTSP = async () => {
    const videoUrl = 'http://localhost:8889/MyStreamName/'

    try {
        const res = await axios.get('/api/videoStream')

        console.log('res :>> ', res)
    } catch (error) {
        console.log(error)
    }

    return (
        <iframe
            src={'/videoStream'}
            style={{ width: '500px', height: '500px' }}
        ></iframe>
    )
}

export default VideoRTSP
