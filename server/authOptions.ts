import type { NextAuthOptions } from "next-auth"
import type { OAuthConfig } from "next-auth/providers/oauth"

function requireEnv(name: string) {
    const value = process.env[name]?.trim()
    if (!value) throw new Error(`Missing env ${name}`)
    return value
}

function issuerUrl(issuer: string, path: string) {
    const base = issuer.endsWith("/") ? issuer : `${issuer}/`
    return new URL(path.replace(/^\//, ""), base).toString()
}

type JwtToken = {
    sub?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresAt?: number
    username?: string
    phone?: string
    role?: string
    error?: "RefreshAccessTokenError"
}

async function refreshAccessToken(token: JwtToken): Promise<JwtToken> {
    if (!token.refreshToken) return { ...token, error: "RefreshAccessTokenError" }

    const issuer = requireEnv("OIDC_ISSUER")
    const clientId = requireEnv("OIDC_SELF_CLIENT_ID")
    const clientSecret = requireEnv("OIDC_SELF_CLIENT_SECRET")

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
    })

    const response = await fetch(issuerUrl(issuer, "token"), {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body,
    })

    if (!response.ok) return { ...token, error: "RefreshAccessTokenError" }

    const refreshed = (await response.json()) as {
        access_token: string
        refresh_token?: string
        expires_in: number
        id_token?: string
    }

    return {
        ...token,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? token.refreshToken,
        accessTokenExpiresAt: Math.floor(Date.now() / 1000 + refreshed.expires_in),
        error: undefined,
    }
}

let cached: NextAuthOptions | undefined

export function getAuthOptions(): NextAuthOptions {
    cached ??= {
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
        session: { strategy: "jwt" },
        providers: [
            {
                id: "oidc",
                name: "MyApp",
                type: "oauth",
                wellKnown: `${requireEnv("OIDC_ISSUER")}/.well-known/openid-configuration`,
                clientId: requireEnv("OIDC_SELF_CLIENT_ID"),
                clientSecret: requireEnv("OIDC_SELF_CLIENT_SECRET"),
                authorization: { params: { scope: "openid profile phone offline_access" } },
                checks: ["pkce", "state"],
                profile(profile: Record<string, unknown>) {
                    const p = profile
                    return {
                        id: String(p.sub),
                        name: typeof p.preferred_username === "string" ? p.preferred_username : undefined,
                    }
                },
            } satisfies OAuthConfig<Record<string, unknown>>,
        ],
        callbacks: {
            async jwt({ token, account, profile }) {
                const typed = token as unknown as JwtToken

                if (account) {
                    typed.accessToken = account.access_token
                    typed.refreshToken = account.refresh_token
                    if (typeof account.expires_at === "number") typed.accessTokenExpiresAt = account.expires_at

                    const p = profile as Record<string, unknown> | undefined

                    if (p) {
                        if (typeof p.preferred_username === "string") typed.username = p.preferred_username
                        if (typeof p.phone_number === "string") typed.phone = p.phone_number
                        if (typeof p.role === "string") typed.role = p.role
                    }
                }

                if (typed.accessToken && typed.accessTokenExpiresAt && Date.now() / 1000 < typed.accessTokenExpiresAt - 30) return typed
                if (typed.refreshToken) return refreshAccessToken(typed)
                return typed
            },
            async session({ session, token }) {
                const typed = token as unknown as JwtToken
                ;(session.user as unknown as { id?: string }).id = typed.sub
                ;(session.user as unknown as { username?: string }).username = typed.username
                ;(session.user as unknown as { phone?: string }).phone = typed.phone
                ;(session.user as unknown as { role?: string }).role = typed.role
                return session
            },
        },
    }

    return cached
}
