import { NextResponse } from "next/server"

import { prisma } from "@/prisma"

import { oidcClientSchema } from "@/schemas/oidcClient"

import { getCurrentUser } from "@/server/getCurrentUser"

export const runtime = "nodejs"

function getClientIdFromRequest(request: Request) {
    const url = new URL(request.url)
    const last = url.pathname.split("/").filter(Boolean).pop()
    const decoded = last ? decodeURIComponent(last).trim() : ""
    if (!decoded) throw new Error("Invalid client_id")
    return decoded
}

export async function GET(request: Request) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, message: "无权限" }, { status: 403 })

    const client_id = getClientIdFromRequest(request)
    const client = await prisma.oidcClient.findUnique({ where: { client_id } })
    if (!client) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
    return NextResponse.json({
        success: true,
        data: {
            client_id: client.client_id,
            client_secret: client.client_secret,
            redirect_uris: JSON.parse(client.redirect_uris) as string[],
            grant_types: JSON.parse(client.grant_types) as string[],
            response_types: JSON.parse(client.response_types) as string[],
            scope: client.scope ?? undefined,
            token_endpoint_auth_method: client.token_endpoint_auth_method ?? undefined,
            application_type: client.application_type ?? undefined,
            client_name: client.client_name ?? undefined,
            is_first_party: client.is_first_party,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        },
    })
}

export async function PUT(request: Request) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, message: "无权限" }, { status: 403 })

    const client_id = getClientIdFromRequest(request)
    const body = await request.json().catch(() => undefined)

    if (!body) {
        console.error("OIDC client update: invalid JSON body", {
            contentType: request.headers.get("content-type"),
            contentLength: request.headers.get("content-length"),
        })

        return NextResponse.json(
            { success: false, message: `请求体为空或无法解析为 JSON（content-type=${request.headers.get("content-type") || "-"}）` },
            { status: 400 },
        )
    }

    const parsed = oidcClientSchema.partial().parse(body)

    const updated = await prisma.oidcClient.update({
        where: { client_id },
        data: {
            client_secret: parsed.client_secret,
            redirect_uris: parsed.redirect_uris ? JSON.stringify(parsed.redirect_uris) : undefined,
            grant_types: parsed.grant_types ? JSON.stringify(parsed.grant_types) : undefined,
            response_types: parsed.response_types ? JSON.stringify(parsed.response_types) : undefined,
            scope: parsed.scope,
            token_endpoint_auth_method: parsed.token_endpoint_auth_method,
            application_type: parsed.application_type,
            client_name: parsed.client_name,
            is_first_party: parsed.is_first_party,
        },
    })

    return NextResponse.json({
        success: true,
        data: {
            client_id: updated.client_id,
            client_secret: updated.client_secret,
            redirect_uris: JSON.parse(updated.redirect_uris) as string[],
            grant_types: JSON.parse(updated.grant_types) as string[],
            response_types: JSON.parse(updated.response_types) as string[],
            scope: updated.scope ?? undefined,
            token_endpoint_auth_method: updated.token_endpoint_auth_method ?? undefined,
            application_type: updated.application_type ?? undefined,
            client_name: updated.client_name ?? undefined,
            is_first_party: updated.is_first_party,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        },
    })
}

export async function DELETE(request: Request) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ success: false, message: "无权限" }, { status: 403 })

    const client_id = getClientIdFromRequest(request)
    await prisma.oidcClient.delete({ where: { client_id } })
    return NextResponse.json({ success: true, data: { success: true } })
}
