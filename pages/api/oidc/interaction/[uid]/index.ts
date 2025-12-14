import type { NextApiRequest, NextApiResponse } from "next"

import { prisma } from "@/prisma"

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

        if (prompt === "consent") {
            const clientIdRaw = details.params.client_id
            const clientId = typeof clientIdRaw === "string" ? clientIdRaw.trim() : ""
            const client = clientId ? await prisma.oidcClient.findUnique({ where: { client_id: clientId } }) : null

            if (client?.is_first_party) {
                const accountId = details.session?.accountId
                if (!accountId) return response.redirect(302, `/login?uid=${encodeURIComponent(uid)}`)

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

                const Grant = (provider as unknown as { Grant: GrantConstructor }).Grant

                let grantId = details.grantId
                const grant = grantId ? await Grant.find(grantId) : new Grant({ accountId, clientId })
                if (!grant) return response.status(400).send("Grant not found")

                const promptDetails = details.prompt?.details ?? {}

                const missingOIDCScope = asStringArray((promptDetails as Record<string, unknown>).missingOIDCScope)
                if (missingOIDCScope?.length) grant.addOIDCScope(missingOIDCScope.join(" "))

                const missingOIDCClaims = asStringArray((promptDetails as Record<string, unknown>).missingOIDCClaims)
                if (missingOIDCClaims?.length) grant.addOIDCClaims(missingOIDCClaims)

                const missingResourceScopes = (promptDetails as Record<string, unknown>).missingResourceScopes

                if (missingResourceScopes && typeof missingResourceScopes === "object") {
                    for (const [indicator, scopes] of Object.entries(missingResourceScopes as Record<string, unknown>)) {
                        const scopesArr = asStringArray(scopes)
                        if (scopesArr?.length) grant.addResourceScope(indicator, scopesArr.join(" "))
                    }
                }

                grantId = await grant.save()

                provider.interactionFinished(
                    request,
                    response,
                    {
                        consent: { grantId },
                    },
                    { mergeWithLastSubmission: true },
                )

                return
            }

            return response.redirect(302, `/oidc/consent?uid=${encodeURIComponent(uid)}`)
        }

        return response.redirect(302, `/login?uid=${encodeURIComponent(uid)}`)
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "Interaction failed"
        return response.status(400).send(message)
    }
}
