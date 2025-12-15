import { useMutation, UseMutationOptions } from "@tanstack/react-query"

import { LoginParams } from "@/schemas/login"

import { request } from "@/utils/request"

export interface LoginOidcInteractionParams extends LoginParams {
    uid: string
}

export interface LoginOidcInteractionResponse {
    returnTo: string
}

export async function loginOidcInteractionClient({ uid, ...body }: LoginOidcInteractionParams) {
    const response = await request<LoginOidcInteractionResponse>(`/api/oidc/interaction/${encodeURIComponent(uid)}/login`, {
        credentials: "include",
        headers: { accept: "application/json" },
        body,
    })
    return response
}

export interface UseLoginOidcInteractionParams<TContext = never> extends Omit<
    UseMutationOptions<LoginOidcInteractionResponse, Error, LoginOidcInteractionParams, TContext>,
    "mutationFn"
> {}

export function useLoginOidcInteraction<TContext = never>(params: UseLoginOidcInteractionParams<TContext> = {}) {
    return useMutation<LoginOidcInteractionResponse, Error, LoginOidcInteractionParams, TContext>({
        mutationFn: loginOidcInteractionClient,
        ...params,
    })
}
