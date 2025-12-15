import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { createOidcClientAction } from "@/actions/createOidcClient"

export const createOidcClientClient = createRequestFn(createOidcClientAction)

export interface UseCreateOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof createOidcClientClient>>, Error, Parameters<typeof createOidcClientClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useCreateOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseCreateOidcClientParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: createOidcClientClient,
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
