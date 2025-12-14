import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

function getUid(req: NextApiRequest) {
    const uid = req.query.uid
    if (typeof uid !== "string" || !uid.trim()) throw new Error("Invalid uid")
    return uid
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end()

    const uid = getUid(req)
    const provider = getOidcProvider()

    try {
        const details = await provider.interactionDetails(req, res)
        const prompt = details.prompt?.name

        if (prompt === "consent") return res.redirect(302, `/oidc/consent?uid=${encodeURIComponent(uid)}`)
        return res.redirect(302, `/login?uid=${encodeURIComponent(uid)}`)
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "Interaction failed"
        return res.status(400).send(message)
    }
}
