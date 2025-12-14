import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method !== "POST") return response.status(405).end()

    const uid = request.query.uid
    if (typeof uid !== "string" || !uid.trim()) return response.status(400).json({ message: "Invalid uid" })

    try {
        const wantsJson = request.headers.accept?.includes("application/json") || request.headers["content-type"]?.includes("application/json")
        const provider = getOidcProvider()

        const result = {
            error: "access_denied",
            error_description: "End-User denied the request",
        }

        if (wantsJson) {
            const returnTo = await provider.interactionResult(request, response, result, { mergeWithLastSubmission: false })
            response.status(200).json({ returnTo })
            return
        }

        provider.interactionFinished(request, response, result, { mergeWithLastSubmission: false })
        return
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "拒绝失败"
        return response.status(400).json({ message })
    }
}
