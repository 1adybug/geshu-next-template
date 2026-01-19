import { prisma } from "@/prisma"

import { User } from "@/prisma/generated/client"

import { DeleteOidcClientParams } from "@/schemas/deleteOidcClient"

import { toOidcClientRecord } from "@/server/oidcClientRecord"

export async function deleteOidcClient({ client_id }: DeleteOidcClientParams) {
    const deleted = await prisma.oidcClient.delete({ where: { client_id } })
    const record = toOidcClientRecord({ client: deleted })
    return record
}

deleteOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
