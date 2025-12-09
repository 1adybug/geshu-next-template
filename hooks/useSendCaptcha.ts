import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { sendCaptchaAction } from "@/actions/sendCaptcha"

import { AccountParams } from "@/schemas/account"

export const sendCaptchaClient = createRequestFn(sendCaptchaAction)

export interface UseSendCaptchaParams<TContext = never> extends Omit<UseMutationOptions<string, Error, AccountParams, TContext>, "mutationFn"> {}

export function useSendCaptcha<TContext = never>(params: UseSendCaptchaParams<TContext> = {}) {
    return useMutation<string, Error, AccountParams, TContext>({
        mutationFn: sendCaptchaClient,
        ...params,
    })
}
