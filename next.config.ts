import { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        nodeMiddleware: true,
    },
}

export default nextConfig
