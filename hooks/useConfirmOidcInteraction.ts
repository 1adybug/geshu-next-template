import { useMutation, UseMutationOptions } from "@tanstack/react-query"

import { request } from "@/utils/request"

export interface ConfirmOidcInteractionParams {
    uid: string
}

export interface ConfirmOidcInteractionResponse {
    returnTo: string
}

export async function confirmOidcInteractionClient({ uid }: ConfirmOidcInteractionParams) {
    const response = await request<ConfirmOidcInteractionResponse>(`/api/oidc/interaction/${encodeURIComponent(uid)}/confirm`, {
        credentials: "include",
        headers: { accept: "application/json" },
    })
    return response
}

export interface UseConfirmOidcInteractionParams<TContext = never> extends Omit<
    UseMutationOptions<ConfirmOidcInteractionResponse, Error, ConfirmOidcInteractionParams, TContext>,
    "mutationFn"
> {}

export function useConfirmOidcInteraction<TContext = never>(params: UseConfirmOidcInteractionParams<TContext> = {}) {
    return useMutation<ConfirmOidcInteractionResponse, Error, ConfirmOidcInteractionParams, TContext>({
        mutationFn: confirmOidcInteractionClient,
        ...params,
    })
}
