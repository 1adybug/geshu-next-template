import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { sendEmailOtpAction } from "@/actions/sendEmailOtp"

import { sendEmailOtpSchema } from "@/schemas/sendEmailOtp"

export const sendEmailOtpClient = createRequestFn({
    fn: sendEmailOtpAction,
    schema: sendEmailOtpSchema,
})

export interface UseSendEmailOtpParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof sendEmailOtpClient>>, Error, Parameters<typeof sendEmailOtpClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useSendEmailOtp<TOnMutateResult = unknown>({ onMutate, onSuccess, onError, onSettled, ...rest }: UseSendEmailOtpParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: sendEmailOtpClient,
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
