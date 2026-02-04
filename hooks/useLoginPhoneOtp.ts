import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { loginPhoneOtpAction } from "@/actions/loginPhoneOtp"

import { loginPhoneOtpSchema } from "@/schemas/loginPhoneOtp"

export const loginPhoneOtpClient = createRequestFn({
    fn: loginPhoneOtpAction,
    schema: loginPhoneOtpSchema,
})

export interface UseLoginPhoneOtpParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof loginPhoneOtpClient>>, Error, Parameters<typeof loginPhoneOtpClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useLoginPhoneOtp<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseLoginPhoneOtpParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: loginPhoneOtpClient,
        onMutate(variables, context) {
            message.open({
                key,
                type: "loading",
                content: "登录中...",
                duration: 0,
            })

            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            message.open({
                key,
                type: "success",
                content: "登录成功",
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
