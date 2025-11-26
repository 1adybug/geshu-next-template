import type { NextApiRequest, NextApiResponse } from "next"

import { finishInteraction } from "@/server/oidc/provider"
import { loginPathname } from "@/server/oidc/settings"

function getBaseUrl(req: NextApiRequest) {
    const protocol = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] || "http"
    return `${protocol}://${req.headers.host}`
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method !== "GET") return response.status(405).end()

    const fullUrl = `${getBaseUrl(request)}${request.url ?? ""}`
    const { accountId } = await finishInteraction(request, response)

    if (accountId) return

    const redirectToLogin = `${loginPathname}?from=${encodeURIComponent(fullUrl)}`
    response.redirect(redirectToLogin)
}
