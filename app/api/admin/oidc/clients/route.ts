import { randomBytes } from "crypto"

import { NextResponse } from "next/server"

import { prisma } from "@/prisma"

import { oidcClientSchema } from "@/schemas/oidcClient"

import { getCurrentUser } from "@/server/getCurrentUser"

export const runtime = "nodejs"

export async function GET() {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ message: "无权限" }, { status: 403 })

    const clients = await prisma.oidcClient.findMany({
        orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(
        clients.map(c => ({
            ...c,
            redirect_uris: JSON.parse(c.redirect_uris) as unknown,
            grant_types: JSON.parse(c.grant_types) as unknown,
            response_types: JSON.parse(c.response_types) as unknown,
            client_secret: c.client_secret ? `${c.client_secret.slice(0, 6)}***` : "",
        })),
    )
}

export async function POST(request: Request) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ message: "无权限" }, { status: 403 })

    const body = await request.json().catch(() => undefined)
    const parsed = oidcClientSchema.parse(body)

    const client_secret = parsed.client_secret ?? randomBytes(32).toString("base64url")

    const created = await prisma.oidcClient.create({
        data: {
            client_id: parsed.client_id,
            client_secret,
            redirect_uris: JSON.stringify(parsed.redirect_uris),
            grant_types: JSON.stringify(parsed.grant_types),
            response_types: JSON.stringify(parsed.response_types),
            scope: parsed.scope ?? "openid profile phone offline_access",
            token_endpoint_auth_method: parsed.token_endpoint_auth_method ?? "client_secret_basic",
            application_type: parsed.application_type ?? "web",
            client_name: parsed.client_name ?? parsed.client_id,
            is_first_party: parsed.is_first_party ?? false,
        },
    })

    return NextResponse.json(created)
}
