import { NextResponse } from "next/server"

import { getEnv } from "@/server/env"
import { getLocalUser } from "@/server/localSession"
import { exchangeCodeForTokens, fetchUserInfo } from "@/server/oidc"
import { clearAuthFlowCookie, getAuthFlowCookie, setLocalUserCookie, setPendingLinkCookie } from "@/server/session"
import { createOrUpdateLink, findLink } from "@/server/storage"

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

    const issuer = env.MYAPP_OIDC_ISSUER
    const sub = String(userinfo.sub)

    const response = NextResponse.redirect(env.APP_URL, 302)
    clearAuthFlowCookie(response)

    const existingLink = await findLink({ issuer, sub })
    const localUser = await getLocalUser()

    if (existingLink) {
        setLocalUserCookie(response, { localUserId: existingLink.localUserId })
        return response
    }

    if (localUser) {
        await createOrUpdateLink({ issuer, sub, localUserId: localUser.id })
        setLocalUserCookie(response, { localUserId: localUser.id })
        return response
    }

    setPendingLinkCookie(response, { issuer, sub })
    return NextResponse.redirect(`${env.APP_URL}/bind`, 302)
}
