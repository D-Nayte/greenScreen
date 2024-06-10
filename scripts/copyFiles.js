// copy the file globale.cc and favicon.ico from src/app to dist/src/app

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const files = ['globals.css', 'favicon.ico']
const src = path.join(__dirname, '../src/app')
const dist = path.join(__dirname, '../dist/src/app')

files.forEach((file) => {
    fs.copyFileSync(path.join(src, file), path.join(dist, file))
})
