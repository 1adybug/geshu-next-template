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

export interface UseConfirmOidcInteractionParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof confirmOidcInteractionClient>>, Error, Parameters<typeof confirmOidcInteractionClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useConfirmOidcInteraction<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseConfirmOidcInteractionParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: confirmOidcInteractionClient,
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
