import { NextResponse } from "next/server"

import { setLocalUserCookie } from "@/server/session"
import { findUserById } from "@/server/storage"

export const runtime = "nodejs"

export async function POST(request: Request) {
    const body = (await request.json().catch(() => undefined)) as { id?: string } | undefined
    const id = body?.id?.trim()
    if (!id) return NextResponse.json({ success: false, message: "缺少 id" }, { status: 400 })

    const user = await findUserById({ id })
    if (!user) return NextResponse.json({ success: false, message: "用户不存在" }, { status: 404 })

    const response = NextResponse.json({ success: true, data: { success: true } })
    setLocalUserCookie(response, { localUserId: id })
    return response
}
