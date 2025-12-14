import { NextResponse } from "next/server"

import { getEnv } from "@/server/env"
import { exchangeCodeForTokens, fetchUserInfo } from "@/server/oidc"
import { clearAuthFlowCookie, getAuthFlowCookie, setSessionCookie } from "@/server/session"

export const runtime = "nodejs"

export async function GET(request: Request) {
    const env = getEnv()
    const url = new URL(request.url)

    const code = url.searchParams.get("code")?.trim()
    const state = url.searchParams.get("state")?.trim()
    if (!code || !state) return NextResponse.json({ message: "Missing code/state" }, { status: 400 })

    const flow = await getAuthFlowCookie()
    if (!flow) return NextResponse.json({ message: "Missing auth flow cookie" }, { status: 400 })
    if (flow.state !== state) return NextResponse.json({ message: "State mismatch" }, { status: 400 })

    const tokenSet = await exchangeCodeForTokens({
        issuer: env.MYAPP_OIDC_ISSUER,
        clientId: env.MYAPP_CLIENT_ID,
        clientSecret: env.MYAPP_CLIENT_SECRET,
        redirectUri: env.MYAPP_REDIRECT_URI,
        code,
        codeVerifier: flow.codeVerifier,
    })

    const userinfo = await fetchUserInfo({
        issuer: env.MYAPP_OIDC_ISSUER,
        accessToken: tokenSet.access_token,
    })

    const response = NextResponse.redirect(env.APP_URL, 302)
    clearAuthFlowCookie(response)

    setSessionCookie(response, {
        sub: String(userinfo.sub),
        scope: tokenSet.scope || "",
        access_token: tokenSet.access_token,
        refresh_token: tokenSet.refresh_token,
        expires_at: tokenSet.expires_at,
    })

    return response
}
