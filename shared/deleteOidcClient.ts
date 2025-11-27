import { User } from "@/prisma/generated/client"

import { resetOidcProvider } from "@/server/oidc/provider"

import { ClientError } from "@/utils/clientError"

import { mapOidcClient, oidcClientTable } from "./oidcClientUtils"

export async function deleteOidcClient(id: string) {
    const entity = await oidcClientTable.findUnique({ where: { id } })
    if (!entity) throw new ClientError("客户端不存在")

    await oidcClientTable.delete({ where: { id } })

    resetOidcProvider()

    return mapOidcClient(entity)
}

deleteOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
