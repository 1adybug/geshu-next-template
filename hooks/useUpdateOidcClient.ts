import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { updateOidcClientAction } from "@/actions/updateOidcClient"

import { updateOidcClientSchema } from "@/schemas/updateOidcClient"

export const updateOidcClientClient = createRequestFn({
    fn: updateOidcClientAction,
    schema: updateOidcClientSchema,
})

export interface UseUpdateOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof updateOidcClientClient>>, Error, Parameters<typeof updateOidcClientClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useUpdateOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseUpdateOidcClientParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: updateOidcClientClient,
        onMutate(variables, context) {
            message.open({
                key,
                type: "loading",
                content: "更新 OIDC 客户端中...",
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
                content: "更新 OIDC 客户端成功",
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
