import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    // oidc-provider expects to be "mounted" under the issuer pathname (e.g. /api/oidc).
    if (request.url?.startsWith("/api/oidc")) {
        // Emulate koa-mount semantics:
        // - originalUrl includes mountPath
        // - url is stripped (so oidc-provider router matches)
        const requestWithOriginalUrl = request as NextApiRequest & { originalUrl?: string }
        requestWithOriginalUrl.originalUrl = request.url
        request.url = request.url.slice("/api/oidc".length) || "/"
    }

    const provider = getOidcProvider()
    await provider.callback()(request, response)
}
