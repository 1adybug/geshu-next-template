import { NextResponse } from "next/server"

import { prisma } from "@/prisma"

import { oidcClientSchema } from "@/schemas/oidcClient"

import { getCurrentUser } from "@/server/getCurrentUser"

export const runtime = "nodejs"

function getClientId(params: { client_id?: string }) {
    const clientId = params.client_id?.trim()
    if (!clientId) throw new Error("Invalid client_id")
    return clientId
}

export async function GET(_request: Request, { params }: { params: { client_id: string } }) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ message: "无权限" }, { status: 403 })

    const client_id = getClientId(params)
    const client = await prisma.oidcClient.findUnique({ where: { client_id } })
    if (!client) return NextResponse.json({ message: "Not found" }, { status: 404 })
    return NextResponse.json({
        ...client,
        redirect_uris: JSON.parse(client.redirect_uris) as unknown,
        grant_types: JSON.parse(client.grant_types) as unknown,
        response_types: JSON.parse(client.response_types) as unknown,
    })
}

export async function PUT(request: Request, { params }: { params: { client_id: string } }) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ message: "无权限" }, { status: 403 })

    const client_id = getClientId(params)
    const body = await request.json().catch(() => undefined)

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

    return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: { params: { client_id: string } }) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: "请先登录" }, { status: 401 })
    if (user.role !== "ADMIN") return NextResponse.json({ message: "无权限" }, { status: 403 })

    const client_id = getClientId(params)
    await prisma.oidcClient.delete({ where: { client_id } })
    return NextResponse.json({ success: true })
}
