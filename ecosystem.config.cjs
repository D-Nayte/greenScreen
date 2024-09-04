/* eslint-disable */
const dotenv = require('dotenv')
const { execSync } = require('child_process')
dotenv.config()

const prodArg = process.argv[5]
const isDevVersion = prodArg !== 'production'
const frontendCount = parseInt(process.env.FRONTEND_INSTANCES) || 1
const backendCount = parseInt(parseInt(process.env.BACKEND_INSTANCES)) || 1

const app = [
    {
        name: 'app',
        script: 'dist/server.js',
        args: '--prod',
        max_memory_restart: '1000M', // Anwendung wird neu gestartet, wenn sie 500MB Speicher verbraucht
        // cwd: 'frontend',
        // instances: 1,
        // exec_mode: 'cluster',
        // env: {
        //     PORT: 3000,
        //     NOT_AVAILABLE: process.env.NOT_AVAILABLE,
        // },
        // node_args: '--prod',
    },
]

module.exports = {
    apps: app,
}
