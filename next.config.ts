import { NextConfig } from "next"

const config: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "1TB",
        },
    },
    output: process.env.NEXT_OUTPUT as "standalone" | "export" | undefined,
}

export default config
