import { NextResponse } from "next/server"

import { createUser, listUsers } from "@/server/storage"

export const runtime = "nodejs"

export async function GET() {
    const users = await listUsers()
    return NextResponse.json({ success: true, data: users })
}

export async function POST(request: Request) {
    const body = (await request.json().catch(() => undefined)) as { username?: string } | undefined
    const username = body?.username?.trim()
    if (!username) return NextResponse.json({ success: false, message: "缺少 username" }, { status: 400 })

    const user = await createUser({ username })
    return NextResponse.json({ success: true, data: user })
}
