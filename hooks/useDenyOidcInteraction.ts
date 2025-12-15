import { useMutation, UseMutationOptions } from "@tanstack/react-query"

import { request } from "@/utils/request"

export interface DenyOidcInteractionParams {
    uid: string
}

export interface DenyOidcInteractionResponse {
    returnTo: string
}

export async function denyOidcInteractionClient({ uid }: DenyOidcInteractionParams) {
    const response = await request<DenyOidcInteractionResponse>(`/api/oidc/interaction/${encodeURIComponent(uid)}/deny`, {
        credentials: "include",
        headers: { accept: "application/json" },
    })
    return response
}

export interface UseDenyOidcInteractionParams<TContext = never> extends Omit<
    UseMutationOptions<DenyOidcInteractionResponse, Error, DenyOidcInteractionParams, TContext>,
    "mutationFn"
> {}

export function useDenyOidcInteraction<TContext = never>(params: UseDenyOidcInteractionParams<TContext> = {}) {
    return useMutation<DenyOidcInteractionResponse, Error, DenyOidcInteractionParams, TContext>({
        mutationFn: denyOidcInteractionClient,
        ...params,
    })
}
