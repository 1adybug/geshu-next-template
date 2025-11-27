import { User } from "@/prisma/generated/client"

import { mapOidcClient, oidcClientTable } from "./oidcClientUtils"

export async function getOidcClient(id: string) {
    const entity = await oidcClientTable.findUnique({ where: { id } })
    if (!entity) return null

    return mapOidcClient(entity)
}

getOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
