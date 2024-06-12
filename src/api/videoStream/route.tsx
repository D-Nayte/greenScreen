import { NextResponse } from 'next/server'
import axios from 'axios'

export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
    const videoStreamUrl = 'http://localhost:8889/MyStreamName/'

    const stream = await axios.get(videoStreamUrl)
    console.log('stream :>> ', stream)

    return NextResponse.json({ stream })
}
