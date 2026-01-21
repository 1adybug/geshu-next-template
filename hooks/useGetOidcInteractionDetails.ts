import { isNonNullable } from "deepsea-tools"
import { createUseQuery } from "soda-tanstack-query"

import { request } from "@/utils/request"

export interface OidcInteractionClient {
    client_id: string
    client_name?: string | undefined
}

export interface OidcInteractionSession {
    accountId: string
}

export interface GetOidcInteractionDetailsResponse {
    uid: string
    prompt?: string | undefined
    params: Record<string, unknown>
    client?: OidcInteractionClient | undefined
    missingOIDCScope?: string[] | undefined
    missingOIDCClaims?: string[] | undefined
    missingResourceScopes?: Record<string, string[]> | undefined
    session?: OidcInteractionSession | undefined
}

export async function getOidcInteractionDetailsClient(uid: string) {
    const response = await request<GetOidcInteractionDetailsResponse>(`/api/oidc/interaction/${encodeURIComponent(uid)}/details`, { method: "GET" })
    return response
}

export async function getOidcInteractionDetailsOptional(uid?: string | undefined) {
    return isNonNullable(uid) ? getOidcInteractionDetailsClient(uid) : null
}

export const useGetOidcInteractionDetails = createUseQuery({
    queryFn: getOidcInteractionDetailsOptional,
    queryKey: "get-oidc-interaction-details",
})
