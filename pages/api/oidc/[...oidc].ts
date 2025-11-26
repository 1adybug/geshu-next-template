import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const provider = await getOidcProvider()
    const callback = provider.callback()
    const originalUrl = request.url || ""
    request.url = originalUrl.replace(/^\/api\/oidc/, "") || "/"
    await callback(request, response)
}
