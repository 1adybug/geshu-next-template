import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

export interface OidcInteractionClient {
    client_id: string
    client_name?: string | undefined
}

export interface OidcInteractionSession {
    accountId: string
}

export interface OidcInteractionDetailsData {
    uid: string
    prompt?: string | undefined
    params: Record<string, unknown>
    client?: OidcInteractionClient | undefined
    missingOIDCScope?: string[] | undefined
    missingOIDCClaims?: string[] | undefined
    missingResourceScopes?: Record<string, string[]> | undefined
    session?: OidcInteractionSession | undefined
}

export interface OidcInteractionDetailsResponse {
    success: boolean
    data?: OidcInteractionDetailsData | undefined
    message?: string | undefined
}

function asStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined
    const strings = value.filter(v => typeof v === "string")
    if (strings.length !== value.length) return undefined
    return strings
}

function asStringArrayRecord(value: unknown): Record<string, string[]> | undefined {
    if (!value || typeof value !== "object") return undefined

    const entries = Object.entries(value)

    const record: Record<string, string[]> = {}

    for (const [key, item] of entries) {
        const strings = asStringArray(item)
        if (!strings) return undefined
        record[key] = strings
    }

    return record
}

function getUid(request: NextApiRequest) {
    const uid = request.query.uid
    if (typeof uid !== "string" || !uid.trim()) throw new Error("Invalid uid")
    return uid
}

export default async function handler(request: NextApiRequest, response: NextApiResponse<OidcInteractionDetailsResponse>) {
    if (request.method !== "GET") return response.status(405).end()

    const uid = getUid(request)
    const provider = getOidcProvider()

    try {
        const details = await provider.interactionDetails(request, response)
        if (details.uid !== uid) return response.status(400).json({ success: false, message: "Interaction mismatch" })

        const missingOIDCScope = asStringArray((details.prompt?.details as Record<string, unknown> | undefined)?.missingOIDCScope)
        const missingOIDCClaims = asStringArray((details.prompt?.details as Record<string, unknown> | undefined)?.missingOIDCClaims)
        const missingResourceScopes = asStringArrayRecord((details.prompt?.details as Record<string, unknown> | undefined)?.missingResourceScopes)
        const accountId = details.session?.accountId

        return response.status(200).json({
            success: true,
            data: {
                uid: details.uid,
                prompt: details.prompt?.name,
                params: details.params as Record<string, unknown>,
                client: details.client
                    ? {
                          client_id: details.client.clientId,
                          client_name: details.client.clientName,
                      }
                    : undefined,
                missingOIDCScope,
                missingOIDCClaims,
                missingResourceScopes,
                session: typeof accountId === "string" ? { accountId } : undefined,
            },
        })
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "Interaction failed"
        return response.status(400).json({ success: false, message })
    }
}
