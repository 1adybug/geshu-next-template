import { randomBytes } from "node:crypto"

import { prisma } from "@/prisma"

import { CreateOidcClientParams } from "@/schemas/createOidcClient"

import { isAdmin } from "@/server/isAdmin"
import { toOidcClientRecord } from "@/server/oidcClientRecord"

import { ClientError } from "@/utils/clientError"

export async function createOidcClient(params: CreateOidcClientParams) {
    const exists = await prisma.oidcClient.findUnique({ where: { client_id: params.client_id } })
    if (exists) throw new ClientError("client_id 已存在")

    const client_secret = params.client_secret ?? randomBytes(32).toString("base64url")

    const created = await prisma.oidcClient.create({
        data: {
            client_id: params.client_id,
            client_secret,
            redirect_uris: JSON.stringify(params.redirect_uris),
            grant_types: JSON.stringify(params.grant_types),
            response_types: JSON.stringify(params.response_types),
            scope: params.scope ?? "openid profile phone offline_access",
            token_endpoint_auth_method: params.token_endpoint_auth_method ?? "client_secret_basic",
            application_type: params.application_type ?? "web",
            client_name: params.client_name ?? params.client_id,
            is_first_party: params.is_first_party ?? false,
        },
    })

    return toOidcClientRecord({ client: created })
}

createOidcClient.filter = isAdmin
