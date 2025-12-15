import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { deleteOidcClientAction } from "@/actions/deleteOidcClient"

export const deleteOidcClientClient = createRequestFn(deleteOidcClientAction)

export interface UseDeleteOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof deleteOidcClientClient>>, Error, Parameters<typeof deleteOidcClientClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useDeleteOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseDeleteOidcClientParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: deleteOidcClientClient,
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
