import { prisma } from "@/prisma"

import { ConnectedApp } from "@/schemas/connectedApp"

import { getCurrentUser } from "@/server/getCurrentUser"

import { ClientError } from "@/utils/clientError"

function parseGrantScopes(payload: unknown): string[] {
    if (!payload || typeof payload !== "object") return []
    const openid = (payload as Record<string, unknown>).openid
    if (!openid || typeof openid !== "object") return []
    const scope = (openid as Record<string, unknown>).scope
    if (typeof scope !== "string") return []

    return scope
        .split(" ")
        .map(item => item.trim())
        .filter(Boolean)
}

export async function listConnectedApps() {
    const user = await getCurrentUser()
    if (!user) throw new ClientError({ message: "请先登录", code: 401 })

    const grants = await prisma.oidcRecord.findMany({
        where: {
            type: "Grant",
            accountId: user.id,
        },
        select: {
            payload: true,
            clientId: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
    })

    const clientIds = Array.from(new Set(grants.map(g => g.clientId).filter((item): item is string => typeof item === "string" && item.trim().length > 0)))

    const clients = clientIds.length
        ? await prisma.oidcClient.findMany({
              where: { client_id: { in: clientIds } },
              select: { client_id: true, client_name: true, is_first_party: true },
          })
        : []

    const clientNameMap = new Map(clients.map(client => [client.client_id, client.client_name ?? undefined] as const))
    const trustedClientIdSet = new Set(clients.filter(client => client.is_first_party).map(client => client.client_id))

    const data: ConnectedApp[] = []

    for (const grant of grants) {
        const client_id = (grant.clientId || "").trim()
        if (!client_id) continue
        if (trustedClientIdSet.has(client_id)) continue

        const client_name = clientNameMap.get(client_id)
        let payload: unknown = undefined

        try {
            payload = JSON.parse(grant.payload) as unknown
        } catch {
            payload = undefined
        }

        data.push({
            client_id,
            ...(client_name ? { client_name } : {}),
            scopes: parseGrantScopes(payload),
            createdAt: grant.createdAt.toISOString(),
            updatedAt: grant.updatedAt.toISOString(),
        })
    }

    return data
}
