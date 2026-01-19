import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { deleteOidcClientAction } from "@/actions/deleteOidcClient"

import { deleteOidcClientSchema } from "@/schemas/deleteOidcClient"

export const deleteOidcClientClient = createRequestFn({
    fn: deleteOidcClientAction,
    schema: deleteOidcClientSchema,
})

export interface UseDeleteOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof deleteOidcClientClient>>, Error, Parameters<typeof deleteOidcClientClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useDeleteOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseDeleteOidcClientParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: deleteOidcClientClient,
        onMutate(variables, context) {
            message.open({
                key,
                type: "loading",
                content: "删除 OIDC 客户端中...",
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
                content: "删除 OIDC 客户端成功",
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
