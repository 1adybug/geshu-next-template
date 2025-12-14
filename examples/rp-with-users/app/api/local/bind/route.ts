import { NextResponse } from "next/server"

import { getEnv } from "@/server/env"
import { clearPendingLinkCookie, getPendingLinkCookie } from "@/server/session"
import { createOrUpdateLink, findUserById } from "@/server/storage"

export const runtime = "nodejs"

export async function POST(request: Request) {
    const env = getEnv()
    const body = (await request.json().catch(() => undefined)) as { localUserId?: string } | undefined
    const localUserId = body?.localUserId?.trim()
    if (!localUserId) return NextResponse.json({ success: false, message: "缺少 localUserId" }, { status: 400 })

    const user = await findUserById({ id: localUserId })
    if (!user) return NextResponse.json({ success: false, message: "本地用户不存在" }, { status: 404 })

    const pending = await getPendingLinkCookie()
    if (!pending) return NextResponse.json({ success: false, message: "没有待绑定的 MyApp 登录信息" }, { status: 400 })
    if (pending.issuer !== env.MYAPP_OIDC_ISSUER) return NextResponse.json({ success: false, message: "Issuer 不匹配" }, { status: 400 })

    await createOrUpdateLink({ issuer: pending.issuer, sub: pending.sub, localUserId })

    const response = NextResponse.json({ success: true, data: { success: true } })
    clearPendingLinkCookie(response)
    return response
}
