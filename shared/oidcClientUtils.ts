import crypto from "crypto"

import { ResponseType } from "oidc-provider"

import { DefaultGrantTypes, DefaultResponseTypes, TokenEndpointAuthMethod, TokenEndpointAuthMethods } from "@/constants/oidc"

import { prisma } from "@/prisma"

import { OidcClient } from "@/prisma/generated/client"

import { splitToList } from "@/schemas/oidcClient"

export const oidcClientTable = prisma.oidcClient

export interface BuildOidcClientPayloadParams {
    name: string
    description?: string
    redirectUris: string
    postLogoutRedirectUris?: string
    grantTypes?: string
    responseTypes?: string
    scope?: string
    tokenEndpointAuthMethod?: TokenEndpointAuthMethod
    enabled?: boolean
}

export interface OidcClientPayload {
    name: string
    description?: string
    redirectUris: string
    postLogoutRedirectUris?: string
    grantTypes: string
    responseTypes: string
    scope?: string
    tokenEndpointAuthMethod: TokenEndpointAuthMethod
    enabled: boolean
}

export interface OidcClientModel {
    id: string
    name: string
    description: string
    clientId: string
    clientSecret: string
    redirectUris: string[]
    postLogoutRedirectUris: string[]
    grantTypes: string[]
    responseTypes: ResponseType[]
    scope: string
    tokenEndpointAuthMethod: TokenEndpointAuthMethod
    enabled: boolean
    createdAt: Date
    updatedAt: Date
}

export interface ClientCredentials {
    clientId: string
    clientSecret: string
}

export interface OidcClientUtilsResult {
    credentials: ClientCredentials
    grantTypes: string[]
    responseTypes: ResponseType[]
    tokenEndpointAuthMethods: TokenEndpointAuthMethod[]
}

const responseTypeSet = new Set<ResponseType>(["code", "id_token", "code id_token", "id_token token", "code token", "code id_token token", "none"])

const tokenEndpointAuthMethodSet = new Set<TokenEndpointAuthMethod>(TokenEndpointAuthMethods)

function serializeList(list?: string[]) {
    return (list ?? [])
        .map(item => item.trim())
        .filter(Boolean)
        .join("\n")
}

export function parseList(value?: string | null) {
    return splitToList(value)
}

export function normalizeGrantTypes(value?: string | null): string[] {
    const list = splitToList(value)
    return list.length > 0 ? list : [...DefaultGrantTypes]
}

function toResponseTypes(value?: string | null): ResponseType[] {
    const list = splitToList(value)
    return list.filter((item): item is ResponseType => responseTypeSet.has(item as ResponseType))
}

export function normalizeResponseTypes(value?: string | null): ResponseType[] {
    const list = toResponseTypes(value)
    return list.length > 0 ? list : [...DefaultResponseTypes]
}

function toTokenEndpointAuthMethod(value?: string | null): TokenEndpointAuthMethod | undefined {
    const trimmed = value?.trim()
    if (!trimmed) return undefined

    if (tokenEndpointAuthMethodSet.has(trimmed as TokenEndpointAuthMethod)) return trimmed as TokenEndpointAuthMethod

    return undefined
}

export function normalizeTokenEndpointAuthMethod(value?: string | null): TokenEndpointAuthMethod {
    return toTokenEndpointAuthMethod(value) ?? "client_secret_basic"
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
}: BuildOidcClientPayloadParams): OidcClientPayload {
    const normalizedGrantTypes = normalizeGrantTypes(grantTypes)
    const normalizedResponseTypes = normalizeResponseTypes(responseTypes)
    const authMethod = normalizeTokenEndpointAuthMethod(tokenEndpointAuthMethod)

    return {
        name: name.trim(),
        description: description?.trim() || undefined,
        redirectUris: serializeList(splitToList(redirectUris)),
        postLogoutRedirectUris: serializeList(splitToList(postLogoutRedirectUris)),
        grantTypes: serializeList(normalizedGrantTypes),
        responseTypes: serializeList(normalizedResponseTypes),
        scope: scope?.trim() || undefined,
        tokenEndpointAuthMethod: authMethod,
        enabled: enabled ?? true,
    }
}

export function mapOidcClient(entity: OidcClient): OidcClientModel {
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
        tokenEndpointAuthMethod: normalizeTokenEndpointAuthMethod(entity.tokenEndpointAuthMethod),
        enabled: entity.enabled,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    }
}

export function generateClientCredentials(): ClientCredentials {
    return {
        clientId: crypto.randomUUID(),
        clientSecret: crypto.randomBytes(32).toString("hex"),
    }
}

export async function oidcClientUtils(): Promise<OidcClientUtilsResult> {
    const credentials = generateClientCredentials()

    return {
        credentials,
        grantTypes: [...DefaultGrantTypes],
        responseTypes: [...DefaultResponseTypes],
        tokenEndpointAuthMethods: [...TokenEndpointAuthMethods],
    }
}
