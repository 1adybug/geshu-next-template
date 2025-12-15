import { prisma } from "@/prisma"

import { User } from "@/prisma/generated/client"

import { UpdateOidcClientParams } from "@/schemas/updateOidcClient"

import { toOidcClientRecord } from "@/server/oidcClientRecord"

import { ClientError } from "@/utils/clientError"

export async function updateOidcClient({ client_id, patch }: UpdateOidcClientParams) {
    const exists = await prisma.oidcClient.findUnique({ where: { client_id } })
    if (!exists) throw new ClientError({ message: "未找到该接入方", code: 404 })

    const updated = await prisma.oidcClient.update({
        where: { client_id },
        data: {
            client_secret: patch.client_secret,
            redirect_uris: patch.redirect_uris ? JSON.stringify(patch.redirect_uris) : undefined,
            grant_types: patch.grant_types ? JSON.stringify(patch.grant_types) : undefined,
            response_types: patch.response_types ? JSON.stringify(patch.response_types) : undefined,
            scope: patch.scope,
            token_endpoint_auth_method: patch.token_endpoint_auth_method,
            application_type: patch.application_type,
            client_name: patch.client_name,
            is_first_party: patch.is_first_party,
        },
    })

    return toOidcClientRecord({ client: updated })
}

updateOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
