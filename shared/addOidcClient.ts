import { User } from "@/prisma/generated/client"

import { AddOidcClientParams } from "@/schemas/addOidcClient"

import { resetOidcProvider } from "@/server/oidc/provider"

import { ClientError } from "@/utils/clientError"

import { buildOidcClientPayload, generateClientCredentials, mapOidcClient, oidcClientTable } from "./oidcClientUtils"

export async function addOidcClient(params: AddOidcClientParams) {
    const payload = buildOidcClientPayload(params)

    const exists = await oidcClientTable.count({ where: { name: payload.name } })
    if (exists > 0) throw new ClientError("名称已存在")

    const { clientId, clientSecret } = generateClientCredentials()

    const entity = await oidcClientTable.create({
        data: {
            ...payload,
            clientId,
            clientSecret,
        },
    })

    resetOidcProvider()

    return mapOidcClient(entity)
}

addOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
