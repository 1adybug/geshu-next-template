import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { registerEmailOtpAction } from "@/actions/registerEmailOtp"

import { registerEmailOtpSchema } from "@/schemas/registerEmailOtp"

export const registerEmailOtpClient = createRequestFn({
    fn: registerEmailOtpAction,
    schema: registerEmailOtpSchema,
})

export interface UseRegisterEmailOtpParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof registerEmailOtpClient>>, Error, Parameters<typeof registerEmailOtpClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useRegisterEmailOtp<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseRegisterEmailOtpParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: registerEmailOtpClient,
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
