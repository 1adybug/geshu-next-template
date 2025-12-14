import type { NextApiRequest, NextApiResponse } from "next"

import { getOidcProvider } from "@/server/oidc/provider"

type GrantInstance = {
    addOIDCScope(scope: string): void
    addOIDCClaims(claims: string[]): void
    addResourceScope(indicator: string, scope: string): void
    save(): Promise<string>
}

type GrantConstructor = {
    find(grantId: string): Promise<GrantInstance | undefined>
    new (args: { accountId: string; clientId: string }): GrantInstance
}

function asStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined
    const strings = value.filter(v => typeof v === "string")
    if (strings.length !== value.length) return undefined
    return strings
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end()

    const uid = req.query.uid
    if (typeof uid !== "string" || !uid.trim()) return res.status(400).json({ message: "Invalid uid" })

    try {
        const wantsJson = req.headers.accept?.includes("application/json") || req.headers["content-type"]?.includes("application/json")
        const provider = getOidcProvider()

        const interactionDetails = await provider.interactionDetails(req, res)

        const accountId = interactionDetails.session?.accountId
        if (!accountId) return res.status(401).json({ message: "Not authenticated" })

        const clientIdRaw = interactionDetails.params.client_id
        const clientId = typeof clientIdRaw === "string" ? clientIdRaw : ""
        if (!clientId) return res.status(400).json({ message: "Invalid client_id" })

        const Grant = (provider as unknown as { Grant: GrantConstructor }).Grant

        let grantId = interactionDetails.grantId
        const grant = grantId ? await Grant.find(grantId) : new Grant({ accountId, clientId })
        if (!grant) return res.status(400).json({ message: "Grant not found" })

        const details = interactionDetails.prompt?.details ?? {}

        const missingOIDCScope = asStringArray((details as Record<string, unknown>).missingOIDCScope)
        if (missingOIDCScope?.length) grant.addOIDCScope(missingOIDCScope.join(" "))

        const missingOIDCClaims = asStringArray((details as Record<string, unknown>).missingOIDCClaims)
        if (missingOIDCClaims?.length) grant.addOIDCClaims(missingOIDCClaims)

        const missingResourceScopes = (details as Record<string, unknown>).missingResourceScopes

        if (missingResourceScopes && typeof missingResourceScopes === "object") {
            for (const [indicator, scopes] of Object.entries(missingResourceScopes as Record<string, unknown>)) {
                const scopesArr = asStringArray(scopes)
                if (scopesArr?.length) grant.addResourceScope(indicator, scopesArr.join(" "))
            }
        }

        grantId = await grant.save()

        const result = {
            consent: { grantId },
        }

        if (wantsJson) {
            const returnTo = await provider.interactionResult(req, res, result, { mergeWithLastSubmission: true })
            res.status(200).json({ returnTo })
            return
        }

        provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true })
        return
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "授权失败"
        return res.status(400).json({ message })
    }
}
