import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { loginPhonePasswordAction } from "@/actions/loginPhonePassword"

import { loginPhonePasswordSchema } from "@/schemas/loginPhonePassword"

export const loginPhonePasswordClient = createRequestFn({
    fn: loginPhonePasswordAction,
    schema: loginPhonePasswordSchema,
})

export interface UseLoginPhonePasswordParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof loginPhonePasswordClient>>, Error, Parameters<typeof loginPhonePasswordClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useLoginPhonePassword<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseLoginPhonePasswordParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: loginPhonePasswordClient,
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
