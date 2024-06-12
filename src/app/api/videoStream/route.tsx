import axios from 'axios'

export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
    const videoStreamUrl = 'rtsp://192.168.178.49:8554/MyStreamName/'

    let videoStream = ''
    try {
        const res = await axios.get<string>(videoStreamUrl)
        videoStream = res.data
        console.log('res :>> ', res.data)
    } catch (error) {
        console.log(
            'AXIOS ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
            error
        )
    }

    return new Response(videoStream, {
        status: 200,
        statusText: 'OK',
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
