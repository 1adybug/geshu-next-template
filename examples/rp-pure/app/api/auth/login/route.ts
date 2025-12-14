import { NextResponse } from "next/server"

import { getEnv } from "@/server/env"
import { setAuthFlowCookie } from "@/server/session"

import { createPkcePair } from "@/utils/pkce"

export const runtime = "nodejs"

export async function GET() {
    const env = getEnv()
    const pkce = createPkcePair()

    const authorizeUrl = new URL(`${env.MYAPP_OIDC_ISSUER}/auth`)
    authorizeUrl.searchParams.set("client_id", env.MYAPP_CLIENT_ID)
    authorizeUrl.searchParams.set("redirect_uri", env.MYAPP_REDIRECT_URI)
    authorizeUrl.searchParams.set("response_type", "code")
    authorizeUrl.searchParams.set("scope", "openid profile phone offline_access")
    authorizeUrl.searchParams.set("code_challenge", pkce.codeChallenge)
    authorizeUrl.searchParams.set("code_challenge_method", "S256")
    authorizeUrl.searchParams.set("state", pkce.state)

    const response = NextResponse.redirect(authorizeUrl.toString(), 302)
    setAuthFlowCookie(response, pkce)
    return response
}
