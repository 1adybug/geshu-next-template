import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end()

    const uid = req.query.uid
    if (typeof uid !== "string" || !uid.trim()) return res.status(400).json({ message: "Invalid uid" })

    try {
        const wantsJson = req.headers.accept?.includes("application/json") || req.headers["content-type"]?.includes("application/json")
        const provider = getOidcProvider()

        const result = {
            error: "access_denied",
            error_description: "End-User denied the request",
        }

        if (wantsJson) {
            const returnTo = await provider.interactionResult(req, res, result, { mergeWithLastSubmission: false })
            res.status(200).json({ returnTo })
            return
        }

        provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false })
        return
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "拒绝失败"
        return res.status(400).json({ message })
    }
}
