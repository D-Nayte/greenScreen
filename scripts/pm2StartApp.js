/* eslint-disable */
import { exec } from 'child_process'

try {
    // Start the frontend
    const app = exec('node dist/server.js --prod')

    // Log the output in order to stream it to pm2
    app?.stdout?.on('data', (data) => {
        console.info(`${data}`)
    })
} catch (err) {
    console.error('Failed to start the frontend:', err)
    process.exit(1)
}
