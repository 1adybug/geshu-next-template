import type { NextApiRequest, NextApiResponse } from "next"

import { getCurrentUserIdFromPagesApiRequest } from "@/server/getCurrentUserIdFromPagesApi"

import { getOidcProvider } from "@/server/oidc/provider"

function getUid(request: NextApiRequest) {
    const uid = request.query.uid
    if (typeof uid !== "string" || !uid.trim()) throw new Error("Invalid uid")
    return uid
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method !== "GET") return response.status(405).end()

    const uid = getUid(request)
    const provider = getOidcProvider()

    try {
        const details = await provider.interactionDetails(request, response)
        const prompt = details.prompt?.name

        if (prompt === "login") {
            const userId = await getCurrentUserIdFromPagesApiRequest(request)

            if (userId) {
                provider.interactionFinished(
                    request,
                    response,
                    {
                        login: { accountId: userId },
                    },
                    { mergeWithLastSubmission: false },
                )

                return
            }
        }

        if (prompt === "consent") return response.redirect(302, `/oidc/consent?uid=${encodeURIComponent(uid)}`)
        return response.redirect(302, `/login?uid=${encodeURIComponent(uid)}`)
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "Interaction failed"
        return response.status(400).send(message)
    }
}
