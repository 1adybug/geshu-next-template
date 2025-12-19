import { useQuery } from "@tanstack/react-query"
import { isNonNullable } from "deepsea-tools"

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

export interface UseGetOidcInteractionDetailsParams {
    uid?: string | undefined
    enabled?: boolean
}

export async function getOidcInteractionDetailsClient(uid: string) {
    const response = await request<GetOidcInteractionDetailsResponse>(`/api/oidc/interaction/${encodeURIComponent(uid)}/details`, { method: "GET" })
    return response
}

export function useGetOidcInteractionDetails(idOrParams?: UseGetOidcInteractionDetailsParams | string | undefined) {
    const { uid, enabled = true } = typeof idOrParams === "object" ? idOrParams : { uid: idOrParams, enabled: true }

    return useQuery({
        queryKey: ["get-oidc-interaction-details", uid],
        queryFn: () => (isNonNullable(uid) ? getOidcInteractionDetailsClient(uid) : null),
        enabled: enabled && isNonNullable(uid),
    })
}
