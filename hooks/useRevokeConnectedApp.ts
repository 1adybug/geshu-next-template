import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { revokeConnectedAppAction } from "@/actions/revokeConnectedApp"

import { revokeConnectedAppSchema } from "@/schemas/revokeConnectedApp"

export const revokeConnectedAppClient = createRequestFn({
    fn: revokeConnectedAppAction,
    schema: revokeConnectedAppSchema,
})

export interface UseRevokeConnectedAppParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof revokeConnectedAppClient>>, Error, Parameters<typeof revokeConnectedAppClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useRevokeConnectedApp<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseRevokeConnectedAppParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: revokeConnectedAppClient,
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
