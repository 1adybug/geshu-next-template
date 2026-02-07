import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { sendVerificationOtpAction } from "@/actions/sendVerificationOtp"

export const sendVerificationOtpClient = createRequestFn({
    fn: sendVerificationOtpAction,
})

export interface UseSendVerificationOtpParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof sendVerificationOtpClient>>, Error, Parameters<typeof sendVerificationOtpClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useSendVerificationOtp<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseSendVerificationOtpParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: sendVerificationOtpClient,
        onMutate(variables, context) {
            message.open({
                key,
                type: "loading",
                content: "中...",
                duration: 0,
            })

            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            message.open({
                key,
                type: "success",
                content: "成功",
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
