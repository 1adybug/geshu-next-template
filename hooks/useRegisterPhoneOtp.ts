import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { registerPhoneOtpAction } from "@/actions/registerPhoneOtp"

import { registerPhoneOtpSchema } from "@/schemas/registerPhoneOtp"

export const registerPhoneOtpClient = createRequestFn({
    fn: registerPhoneOtpAction,
    schema: registerPhoneOtpSchema,
})

export interface UseRegisterPhoneOtpParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof registerPhoneOtpClient>>, Error, Parameters<typeof registerPhoneOtpClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useRegisterPhoneOtp<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseRegisterPhoneOtpParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: registerPhoneOtpClient,
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
