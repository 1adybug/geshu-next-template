import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // oidc-provider expects to be "mounted" under the issuer pathname (e.g. /api/oidc).
    if (req.url?.startsWith("/api/oidc")) {
        // Emulate koa-mount semantics:
        // - originalUrl includes mountPath
        // - url is stripped (so oidc-provider router matches)
        const reqWithOriginalUrl = req as NextApiRequest & { originalUrl?: string }
        reqWithOriginalUrl.originalUrl = req.url
        req.url = req.url.slice("/api/oidc".length) || "/"
    }

    const provider = getOidcProvider()
    await provider.callback()(req, res)
}
