import { NextResponse } from "next/server"

import { getEnv } from "@/server/env"
import { introspectToken } from "@/server/oidc"
import { getSession } from "@/server/session"

export const runtime = "nodejs"

export async function GET() {
    const env = getEnv()
    const session = await getSession()
    if (!session) return NextResponse.json({ message: "未登录" }, { status: 401 })

    const result = await introspectToken({
        issuer: env.MYAPP_OIDC_ISSUER,
        clientId: env.MYAPP_CLIENT_ID,
        clientSecret: env.MYAPP_CLIENT_SECRET,
        token: session.access_token,
    })

    if (!result.active) return NextResponse.json({ message: "Token 无效" }, { status: 401 })

    return NextResponse.json({
        sub: result.sub,
        scope: result.scope,
        client_id: result.client_id,
        active: result.active,
    })
}
