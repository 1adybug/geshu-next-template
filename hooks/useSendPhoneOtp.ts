import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { sendPhoneOtpAction } from "@/actions/sendPhoneOtp"

import { sendPhoneOtpSchema } from "@/schemas/sendPhoneOtp"

export const sendPhoneOtpClient = createRequestFn({
    fn: sendPhoneOtpAction,
    schema: sendPhoneOtpSchema,
})

export interface UseSendPhoneOtpParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof sendPhoneOtpClient>>, Error, Parameters<typeof sendPhoneOtpClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useSendPhoneOtp<TOnMutateResult = unknown>({ onMutate, onSuccess, onError, onSettled, ...rest }: UseSendPhoneOtpParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: sendPhoneOtpClient,
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            message.open({
                key,
                type: "success",
                content: `验证码已发送至 ${data}`,
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
