import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { loginEmailPasswordAction } from "@/actions/loginEmailPassword"

import { loginEmailPasswordSchema } from "@/schemas/loginEmailPassword"

export const loginEmailPasswordClient = createRequestFn({
    fn: loginEmailPasswordAction,
    schema: loginEmailPasswordSchema,
})

export interface UseLoginEmailPasswordParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof loginEmailPasswordClient>>, Error, Parameters<typeof loginEmailPasswordClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useLoginEmailPassword<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseLoginEmailPasswordParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: loginEmailPasswordClient,
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
