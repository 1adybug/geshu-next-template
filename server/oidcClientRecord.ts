import { OidcClient } from "@/prisma/generated/client"

import { OidcClientRecord } from "@/schemas/oidcClientRecord"

export interface ToOidcClientRecordParams {
    client: OidcClient
    maskSecret?: boolean
}

export function toOidcClientRecord({ client, maskSecret }: ToOidcClientRecordParams): OidcClientRecord {
    const secret = String(client.client_secret || "")
    const client_secret = maskSecret ? (secret ? `${secret.slice(0, 6)}***` : "") : secret

    return {
        client_id: client.client_id,
        client_secret,
        redirect_uris: JSON.parse(client.redirect_uris) as string[],
        grant_types: JSON.parse(client.grant_types) as string[],
        response_types: JSON.parse(client.response_types) as string[],
        scope: client.scope ?? undefined,
        token_endpoint_auth_method: client.token_endpoint_auth_method ?? undefined,
        application_type: client.application_type ?? undefined,
        client_name: client.client_name ?? undefined,
        is_first_party: client.is_first_party,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
    }
}
