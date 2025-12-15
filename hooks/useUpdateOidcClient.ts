import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { updateOidcClientAction } from "@/actions/updateOidcClient"

export const updateOidcClientClient = createRequestFn(updateOidcClientAction)

export interface UseUpdateOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof updateOidcClientClient>>, Error, Parameters<typeof updateOidcClientClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useUpdateOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseUpdateOidcClientParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: updateOidcClientClient,
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
