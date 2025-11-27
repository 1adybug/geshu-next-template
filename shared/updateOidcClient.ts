import { User } from "@/prisma/generated/client"

import { UpdateOidcClientParams } from "@/schemas/updateOidcClient"

import { resetOidcProvider } from "@/server/oidc/provider"

import { ClientError } from "@/utils/clientError"

import { buildOidcClientPayload, mapOidcClient, oidcClientTable } from "./oidcClientUtils"

export async function updateOidcClient({ id, ...rest }: UpdateOidcClientParams) {
    const existsClient = await oidcClientTable.findUnique({ where: { id } })
    if (!existsClient) throw new ClientError("客户端不存在")

    const payload = buildOidcClientPayload(rest)

    const exists = await oidcClientTable.count({
        where: {
            id: {
                not: id,
            },
            name: payload.name,
        },
    })
    if (exists > 0) throw new ClientError("名称已存在")

    const entity = await oidcClientTable.update({
        where: { id },
        data: payload,
    })

    resetOidcProvider()

    return mapOidcClient(entity)
}

updateOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
