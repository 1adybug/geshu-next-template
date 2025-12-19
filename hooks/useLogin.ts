import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { loginAction } from "@/actions/login"

import { loginSchema } from "@/schemas/login"

export const loginClient = createRequestFn({
    fn: loginAction,
    schema: loginSchema,
})

export interface UseLoginParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof loginClient>>, Error, Parameters<typeof loginClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useLogin<TOnMutateResult = unknown>({ onMutate, onSuccess, onError, onSettled, ...rest }: UseLoginParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: loginClient,
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
