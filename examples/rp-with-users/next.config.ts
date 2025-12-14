import { dirname } from "path"
import { fileURLToPath } from "url"

import { NextConfig } from "next"

const configDir = dirname(fileURLToPath(import.meta.url))

const config: NextConfig = {
    turbopack: {
        root: configDir,
    },
}

export default config
