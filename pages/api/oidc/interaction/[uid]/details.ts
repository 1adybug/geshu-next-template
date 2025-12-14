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
        if (details.uid !== uid) return res.status(400).json({ message: "Interaction mismatch" })

        return res.status(200).json({
            uid: details.uid,
            prompt: details.prompt?.name,
            params: details.params,
            client: details.client
                ? {
                      client_id: details.client.clientId,
                      client_name: details.client.clientName,
                  }
                : undefined,
            missingOIDCScope: details.prompt?.details?.missingOIDCScope,
            missingOIDCClaims: details.prompt?.details?.missingOIDCClaims,
            missingResourceScopes: details.prompt?.details?.missingResourceScopes,
            session: details.session
                ? {
                      accountId: details.session.accountId,
                  }
                : undefined,
        })
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "Interaction failed"
        return res.status(400).json({ message })
    }
}
