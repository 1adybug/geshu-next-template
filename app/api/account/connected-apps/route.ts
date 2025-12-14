import { NextResponse } from "next/server"

import { prisma } from "@/prisma"

import { getCurrentUser } from "@/server/getCurrentUser"

export const runtime = "nodejs"

export interface ConnectedApp {
    client_id: string
    client_name?: string
    scopes: string[]
    createdAt: string
    updatedAt: string
}

function parseGrantScopes(payload: unknown): string[] {
    if (!payload || typeof payload !== "object") return []
    const openid = (payload as Record<string, unknown>).openid
    if (!openid || typeof openid !== "object") return []
    const scope = (openid as Record<string, unknown>).scope
    if (typeof scope !== "string") return []
    return scope
        .split(" ")
        .map(s => s.trim())
        .filter(Boolean)
}

export async function GET() {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })

    const grants = await prisma.oidcRecord.findMany({
        where: {
            type: "Grant",
            accountId: user.id,
        },
        select: {
            id: true,
            payload: true,
            clientId: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
    })

    const clientIds = Array.from(new Set(grants.map(g => g.clientId).filter((c): c is string => typeof c === "string" && c.trim().length > 0)))
    const clients = clientIds.length
        ? await prisma.oidcClient.findMany({
              where: { client_id: { in: clientIds } },
              select: { client_id: true, client_name: true, is_first_party: true },
          })
        : []

    const clientNameMap = new Map(clients.map(c => [c.client_id, c.client_name ?? undefined] as const))
    const firstPartySet = new Set(clients.filter(c => c.is_first_party).map(c => c.client_id))

    const data: ConnectedApp[] = []

    for (const grant of grants) {
        const client_id = (grant.clientId || "").trim()
        if (!client_id) continue
        if (firstPartySet.has(client_id)) continue

        const client_name = clientNameMap.get(client_id)

        data.push({
            client_id,
            ...(client_name ? { client_name } : {}),
            scopes: parseGrantScopes(JSON.parse(grant.payload) as unknown),
            createdAt: grant.createdAt.toISOString(),
            updatedAt: grant.updatedAt.toISOString(),
        })
    }

    return NextResponse.json({ success: true, data })
}
