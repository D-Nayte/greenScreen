//remove dist/ folder
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

//(node:18780) [DEP0147] DeprecationWarning: In future versions of Node.js, fs.rmdir(path, { recursive: true }) will be removed. Use fs.rm(path, { recursive: true }) instead

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const removeOldDist = () => {
    const distPath = path.resolve(__dirname, '../dist')
    if (fs.existsSync(distPath)) {
        fs.rm(distPath, { recursive: true }, () => {
            console.log('Old dist/ folder removed')
        })
    }
}

removeOldDist()
