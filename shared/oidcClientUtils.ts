import crypto from "crypto"

import { DefaultGrantTypes, DefaultResponseTypes } from "@/constants/oidc"

import { prisma } from "@/prisma"

import { OidcClient } from "@/prisma/generated/client"

import { splitToList } from "@/schemas/oidcClient"

export const oidcClientTable = prisma.oidcClient

function serializeList(list?: string[]) {
    return (list ?? [])
        .map(item => item.trim())
        .filter(Boolean)
        .join("\n")
}

export function parseList(value?: string | null) {
    return splitToList(value)
}

export function normalizeGrantTypes(value?: string | null) {
    const list = splitToList(value)
    return list.length > 0 ? list : [...DefaultGrantTypes]
}

export function normalizeResponseTypes(value?: string | null) {
    const list = splitToList(value)
    return list.length > 0 ? list : [...DefaultResponseTypes]
}

export function buildOidcClientPayload({
    name,
    description,
    redirectUris,
    postLogoutRedirectUris,
    grantTypes,
    responseTypes,
    scope,
    tokenEndpointAuthMethod,
    enabled,
}: {
    name: string
    description?: string
    redirectUris: string
    postLogoutRedirectUris?: string
    grantTypes?: string
    responseTypes?: string
    scope?: string
    tokenEndpointAuthMethod?: string
    enabled?: boolean
}) {
    const normalizedGrantTypes = normalizeGrantTypes(grantTypes)
    const normalizedResponseTypes = normalizeResponseTypes(responseTypes)

    return {
        name: name.trim(),
        description: description?.trim() || undefined,
        redirectUris: serializeList(splitToList(redirectUris)),
        postLogoutRedirectUris: serializeList(splitToList(postLogoutRedirectUris)),
        grantTypes: serializeList(normalizedGrantTypes),
        responseTypes: serializeList(normalizedResponseTypes),
        scope: scope?.trim() || undefined,
        tokenEndpointAuthMethod: tokenEndpointAuthMethod ?? "client_secret_basic",
        enabled: enabled ?? true,
    }
}

export function mapOidcClient(entity: OidcClient) {
    return {
        id: entity.id,
        name: entity.name,
        description: entity.description ?? "",
        clientId: entity.clientId,
        clientSecret: entity.clientSecret,
        redirectUris: parseList(entity.redirectUris),
        postLogoutRedirectUris: parseList(entity.postLogoutRedirectUris),
        grantTypes: normalizeGrantTypes(entity.grantTypes),
        responseTypes: normalizeResponseTypes(entity.responseTypes),
        scope: entity.scope ?? "",
        tokenEndpointAuthMethod: entity.tokenEndpointAuthMethod,
        enabled: entity.enabled,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    }
}

export function generateClientCredentials() {
    return {
        clientId: crypto.randomUUID(),
        clientSecret: crypto.randomBytes(32).toString("hex"),
    }
}
