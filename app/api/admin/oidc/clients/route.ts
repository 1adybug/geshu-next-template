import { randomBytes } from "crypto"

import { NextResponse } from "next/server"

import { prisma } from "@/prisma"

import { oidcClientSchema } from "@/schemas/oidcClient"

import { getCurrentUser } from "@/server/getCurrentUser"

export const runtime = "nodejs"

export async function GET() {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, message: "无权限" }, { status: 403 })

    const clients = await prisma.oidcClient.findMany({
        orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({
        success: true,
        data: clients.map(c => ({
            client_id: c.client_id,
            client_secret: c.client_secret ? `${c.client_secret.slice(0, 6)}***` : "",
            redirect_uris: JSON.parse(c.redirect_uris) as string[],
            grant_types: JSON.parse(c.grant_types) as string[],
            response_types: JSON.parse(c.response_types) as string[],
            scope: c.scope ?? undefined,
            token_endpoint_auth_method: c.token_endpoint_auth_method ?? undefined,
            application_type: c.application_type ?? undefined,
            client_name: c.client_name ?? undefined,
            is_first_party: c.is_first_party,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        })),
    })
}

export async function POST(request: Request) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, message: "无权限" }, { status: 403 })

    const rawBody = await request.text().catch(() => "")
    let body: unknown = undefined

    if (rawBody) {
        try {
            body = JSON.parse(rawBody) as unknown
        } catch {
            body = undefined
        }
    }

    if (!body) {
        console.error("OIDC client create: invalid JSON body", {
            contentType: request.headers.get("content-type"),
            contentLength: request.headers.get("content-length"),
        })

        return NextResponse.json({ success: false, message: "请求体为空或无法解析为 JSON" }, { status: 400 })
    }

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

    return NextResponse.json({
        success: true,
        data: {
            client_id: created.client_id,
            client_secret: created.client_secret,
            redirect_uris: JSON.parse(created.redirect_uris) as string[],
            grant_types: JSON.parse(created.grant_types) as string[],
            response_types: JSON.parse(created.response_types) as string[],
            scope: created.scope ?? undefined,
            token_endpoint_auth_method: created.token_endpoint_auth_method ?? undefined,
            application_type: created.application_type ?? undefined,
            client_name: created.client_name ?? undefined,
            is_first_party: created.is_first_party,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
        },
    })
}
