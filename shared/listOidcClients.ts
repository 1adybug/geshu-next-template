import { prisma } from "@/prisma"

import { isAdmin } from "@/server/isAdmin"
import { toOidcClientRecord } from "@/server/oidcClientRecord"

export async function listOidcClients() {
    const clients = await prisma.oidcClient.findMany({
        orderBy: { updatedAt: "desc" },
    })

    return clients.map(client => toOidcClientRecord({ client, maskSecret: true }))
}

listOidcClients.filter = isAdmin
