import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { NextConfig } from "next"

const configDir = dirname(fileURLToPath(import.meta.url))

const config: NextConfig = {
    turbopack: {
        root: configDir,
    },
}

export default config
