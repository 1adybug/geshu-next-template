import { useId } from "react"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { updateSystemConfigAction } from "@/actions/updateSystemConfig"

import { systemConfigSchema } from "@/schemas/systemConfig"

export const updateSystemConfigClient = createRequestFn({
    fn: updateSystemConfigAction,
    schema: systemConfigSchema,
})

export interface UseUpdateSystemConfigParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof updateSystemConfigClient>>, Error, Parameters<typeof updateSystemConfigClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useUpdateSystemConfig<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseUpdateSystemConfigParams<TOnMutateResult> = {}) {
    const key = useId()

    return useMutation({
        mutationFn: updateSystemConfigClient,
        onMutate(variables, context) {
            message.open({
                key,
                type: "loading",
                content: "更新系统设置中...",
                duration: 0,
            })

            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            context.client.invalidateQueries({ queryKey: ["get-system-config"] })

            message.open({
                key,
                type: "success",
                content: "更新系统设置成功",
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
