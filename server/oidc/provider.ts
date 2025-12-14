import Provider from "oidc-provider"

import { prisma } from "@/prisma"

import { oidcAdapterFactory } from "./adapter"
import { getOidcJwks } from "./jwks"

function getIssuer() {
    const issuer = process.env.OIDC_ISSUER?.trim()
    if (!issuer) throw new Error("Missing env OIDC_ISSUER (e.g. http://localhost:3000/api/oidc)")
    return issuer
}

declare global {
    var __OIDC_PROVIDER__: Provider | undefined
}

export function getOidcProvider() {
    const cookieKeys = (
        process.env.OIDC_COOKIE_KEYS?.split(",")
            .map(s => s.trim())
            .filter(Boolean) ?? []
    ).slice(0, 10)

    if (cookieKeys.length === 0) throw new Error("Missing env OIDC_COOKIE_KEYS (comma-separated, used to sign oidc-provider cookies)")

    globalThis.__OIDC_PROVIDER__ ??= new Provider(getIssuer(), {
        adapter: oidcAdapterFactory,
        jwks: getOidcJwks(),
        clients: [],
        rotateRefreshToken: true,
        cookies: {
            keys: cookieKeys,
            names: {
                session: "_oidc_session",
                interaction: "_oidc_interaction",
                resume: "_oidc_interaction_resume",
            },
        },
        claims: {
            openid: ["sub"],
            profile: ["preferred_username", "role"],
            phone: ["phone_number"],
        },
        ttl: {
            AccessToken: 60 * 60,
            RefreshToken: 60 * 60 * 24 * 30,
        },
        features: {
            devInteractions: { enabled: false },
            introspection: { enabled: true },
            revocation: { enabled: true },
            rpInitiatedLogout: { enabled: true },
        },
        interactions: {
            url(_ctx: unknown, interaction: { uid: string; prompt?: { name?: string } }) {
                // Important: oidc-provider scopes the interaction cookie to the returned pathname.
                // We keep it under `/api/oidc/interaction/:uid` so that subsequent XHRs to
                // `/api/oidc/interaction/:uid/*` carry the cookie (otherwise cookie path would be `/login`).
                return `/api/oidc/interaction/${interaction.uid}`
            },
        },
        findAccount: async (_ctx: unknown, id: string) => {
            const user = await prisma.user.findUnique({ where: { id } })
            if (!user) return undefined

            return {
                accountId: id,
                async claims() {
                    return {
                        sub: user.id,
                        preferred_username: user.username,
                        phone_number: user.phone,
                        role: user.role,
                    }
                },
            }
        },
    })

    return globalThis.__OIDC_PROVIDER__!
}
