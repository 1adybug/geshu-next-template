import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { registerEmailPasswordAction } from "@/actions/registerEmailPassword"

import { registerEmailPasswordSchema } from "@/schemas/registerEmailPassword"

export const registerEmailPasswordClient = createRequestFn({
    fn: registerEmailPasswordAction,
    schema: registerEmailPasswordSchema,
})

export interface UseRegisterEmailPasswordParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof registerEmailPasswordClient>>, Error, Parameters<typeof registerEmailPasswordClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useRegisterEmailPassword<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseRegisterEmailPasswordParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: registerEmailPasswordClient,
        onMutate(variables, context) {
            message.open({
                key,
                type: "loading",
                content: "注册中...",
                duration: 0,
            })

            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            message.open({
                key,
                type: "success",
                content: "注册成功",
            })

            return onSuccess?.(data, variables, onMutateResult, context)
        },
        onError(error, variables, onMutateResult, context) {
            message.destroy(key)
            return onError?.(error, variables, onMutateResult, context)
        },
        onSettled(data, error, variables, onMutateResult, context) {
            return onSettled?.(data, error, variables, onMutateResult, context)
        },
        ...rest,
    })
}
