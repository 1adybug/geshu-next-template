import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { registerPhonePasswordAction } from "@/actions/registerPhonePassword"

import { registerPhonePasswordSchema } from "@/schemas/registerPhonePassword"

export const registerPhonePasswordClient = createRequestFn({
    fn: registerPhonePasswordAction,
    schema: registerPhonePasswordSchema,
})

export interface UseRegisterPhonePasswordParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof registerPhonePasswordClient>>, Error, Parameters<typeof registerPhonePasswordClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useRegisterPhonePassword<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseRegisterPhonePasswordParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: registerPhonePasswordClient,
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
