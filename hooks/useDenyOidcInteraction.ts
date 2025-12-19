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

export interface UseDenyOidcInteractionParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof denyOidcInteractionClient>>, Error, Parameters<typeof denyOidcInteractionClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useDenyOidcInteraction<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseDenyOidcInteractionParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: denyOidcInteractionClient,
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
