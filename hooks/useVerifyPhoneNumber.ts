import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { verifyPhoneNumberAction } from "@/actions/verifyPhoneNumber"

export const verifyPhoneNumberClient = createRequestFn({
    fn: verifyPhoneNumberAction,
})

export interface UseVerifyPhoneNumberParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof verifyPhoneNumberClient>>, Error, Parameters<typeof verifyPhoneNumberClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useVerifyPhoneNumber<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseVerifyPhoneNumberParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: verifyPhoneNumberClient,
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
