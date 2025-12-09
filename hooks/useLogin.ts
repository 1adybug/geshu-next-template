import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { loginAction } from "@/actions/login"

import { LoginParams } from "@/schemas/login"

export const loginClient = createRequestFn(loginAction)

export interface UseLoginParams<TContext = never> extends Omit<UseMutationOptions<void, Error, LoginParams, TContext>, "mutationFn"> {}

export function useLogin<TContext = never>(params: UseLoginParams<TContext> = {}) {
    return useMutation<void, Error, LoginParams, TContext>({
        mutationFn: loginClient,
        ...params,
    })
}
