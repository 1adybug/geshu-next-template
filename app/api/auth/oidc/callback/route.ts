import { Buffer } from "node:buffer"

import { decodeJwt } from "jose"
import { NextRequest, NextResponse } from "next/server"

import { issuer, selfClientId, selfClientSecret, selfRedirectUri } from "@/server/oidc/settings"
import { sign } from "@/server/sign"
import { getCookieKey } from "@/utils/getCookieKey"

export async function GET(request: NextRequest) {
    const url = request.nextUrl
    const error = url.searchParams.get("error")
    if (error) return NextResponse.json({ error, description: url.searchParams.get("error_description") }, { status: 400 })

    const code = url.searchParams.get("code")
    if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 })

    const tokenUrl = new URL("token", `${issuer}/`)
    const codeVerifier = request.cookies.get("oidc_pkce_verifier")?.value
    if (!codeVerifier) return NextResponse.json({ error: "missing_code_verifier" }, { status: 400 })

    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: selfRedirectUri,
        code_verifier: codeVerifier,
    })

    const basicAuth = Buffer.from(`${selfClientId}:${selfClientSecret}`).toString("base64")
    const tokenResponse = await fetch(tokenUrl.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${basicAuth}`,
        },
        body: params.toString(),
    })

    if (!tokenResponse.ok) {
        const message = await tokenResponse.text()
        return NextResponse.json({ error: "token_exchange_failed", message }, { status: 502 })
    }

    const tokens = await tokenResponse.json()
    const idToken = tokens.id_token
    if (!idToken || typeof idToken !== "string") return NextResponse.json({ error: "missing_id_token" }, { status: 502 })

    const payload = decodeJwt(idToken)
    const sub = payload.sub
    if (!sub || typeof sub !== "string") return NextResponse.json({ error: "invalid_id_token" }, { status: 502 })

    const sessionToken = await sign(sub)
    const state = url.searchParams.get("state")

    const redirectTo = (() => {
        if (!state) return "/"

        try {
            const target = new URL(state, url.origin)
            if (target.origin !== url.origin) return "/"
            return `${target.pathname}${target.search}`
        } catch (error) {
            return "/"
        }
    })()

    const response = NextResponse.redirect(redirectTo)

    response.cookies.set(getCookieKey("token"), sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: url.protocol === "https:",
    })

    response.cookies.delete("oidc_pkce_verifier")

    return response
}
