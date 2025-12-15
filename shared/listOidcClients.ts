import { prisma } from "@/prisma"

import { User } from "@/prisma/generated/client"

import { toOidcClientRecord } from "@/server/oidcClientRecord"

export async function listOidcClients() {
    const clients = await prisma.oidcClient.findMany({
        orderBy: { updatedAt: "desc" },
    })

    return clients.map(client => toOidcClientRecord({ client, maskSecret: true }))
}

listOidcClients.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
