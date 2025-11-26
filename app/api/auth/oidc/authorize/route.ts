import crypto from "node:crypto"

import { NextRequest, NextResponse } from "next/server"

import { issuer, selfClientId, selfRedirectUri } from "@/server/oidc/settings"

function toBase64Url(buffer: Buffer) {
    return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

export async function GET(request: NextRequest) {
    const from = request.nextUrl.searchParams.get("from") ?? request.nextUrl.searchParams.get("redirect")

    const verifier = toBase64Url(crypto.randomBytes(32))
    const challenge = toBase64Url(crypto.createHash("sha256").update(verifier).digest())

    const authorizeUrl = new URL("auth", `${issuer}/`)
    authorizeUrl.searchParams.set("client_id", selfClientId)
    authorizeUrl.searchParams.set("redirect_uri", selfRedirectUri)
    authorizeUrl.searchParams.set("response_type", "code")
    authorizeUrl.searchParams.set("scope", "openid profile phone offline_access")
    authorizeUrl.searchParams.set("code_challenge_method", "S256")
    authorizeUrl.searchParams.set("code_challenge", challenge)

    if (from) authorizeUrl.searchParams.set("state", from)

    const response = NextResponse.redirect(authorizeUrl.toString())

    response.cookies.set("oidc_pkce_verifier", verifier, {
        httpOnly: true,
        sameSite: "lax",
        path: "/api/auth/oidc",
        secure: request.nextUrl.protocol === "https:",
    })

    return response
}
