import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { createOidcClientAction } from "@/actions/createOidcClient"

import { createOidcClientSchema } from "@/schemas/createOidcClient"

export const createOidcClientClient = createRequestFn({
    fn: createOidcClientAction,
    schema: createOidcClientSchema,
})

export interface UseCreateOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof createOidcClientClient>>, Error, Parameters<typeof createOidcClientClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useCreateOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseCreateOidcClientParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: createOidcClientClient,
        onMutate(variables, context) {
            message.open({
                key,
                type: "loading",
                content: "创建 OIDC 客户端中...",
                duration: 0,
            })

            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            context.client.invalidateQueries({ queryKey: ["list-oidc-clients"] })
            context.client.invalidateQueries({ queryKey: ["get-oidc-client", data.client_id] })

            message.open({
                key,
                type: "success",
                content: "创建 OIDC 客户端成功",
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
