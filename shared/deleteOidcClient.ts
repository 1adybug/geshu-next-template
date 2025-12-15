import { prisma } from "@/prisma"

import { User } from "@/prisma/generated/client"

import { DeleteOidcClientParams } from "@/schemas/deleteOidcClient"

export async function deleteOidcClient({ client_id }: DeleteOidcClientParams) {
    await prisma.oidcClient.delete({ where: { client_id } })
    return { success: true } as const
}

deleteOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
