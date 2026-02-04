import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { loginEmailOtpAction } from "@/actions/loginEmailOtp"

import { loginEmailOtpSchema } from "@/schemas/loginEmailOtp"

export const loginEmailOtpClient = createRequestFn({
    fn: loginEmailOtpAction,
    schema: loginEmailOtpSchema,
})

export interface UseLoginEmailOtpParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof loginEmailOtpClient>>, Error, Parameters<typeof loginEmailOtpClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useLoginEmailOtp<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseLoginEmailOtpParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: loginEmailOtpClient,
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
