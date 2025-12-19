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

export interface UseLoginOidcInteractionParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof loginOidcInteractionClient>>, Error, Parameters<typeof loginOidcInteractionClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useLoginOidcInteraction<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseLoginOidcInteractionParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: loginOidcInteractionClient,
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            return onSuccess?.(data, variables, onMutateResult, context)
        },
        onError(error, variables, onMutateResult, context) {
            return onError?.(error, variables, onMutateResult, context)
        },
        onSettled(data, error, variables, onMutateResult, context) {
            return onSettled?.(data, error, variables, onMutateResult, context)
        },
        ...rest,
    })
}
