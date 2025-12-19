import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { sendCaptchaAction } from "@/actions/sendCaptcha"

import { accountSchema } from "@/schemas/account"

export const sendCaptchaClient = createRequestFn({
    fn: sendCaptchaAction,
    schema: accountSchema,
})

export interface UseSendCaptchaParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof sendCaptchaClient>>, Error, Parameters<typeof sendCaptchaClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useSendCaptcha<TOnMutateResult = unknown>({ onMutate, onSuccess, onError, onSettled, ...rest }: UseSendCaptchaParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: sendCaptchaClient,
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            return onSuccess?.(data, variables, onMutateResult, context)
        },
        onError(error, variables, onMutateResult, context) {
            return onError?.(error, variables, onMutateResult, context)
        },
        onSettled(data, error, variables, onMutateResult, context) {
            return onSettled?.(data, error, variables, onMutateResult, context)
        },
        ...rest,
    })
}
