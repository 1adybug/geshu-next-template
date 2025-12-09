import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { addUserAction } from "@/actions/addUser"

export const addUserClient = createRequestFn(addUserAction)

export interface UseAddUserParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<Awaited<ReturnType<typeof addUserClient>>, Error, Parameters<typeof addUserClient>[0], TOnMutateResult>,
    "mutationFn"
> {}

export function useAddUser<TOnMutateResult = unknown>({ onMutate, onSuccess, onError, onSettled, ...rest }: UseAddUserParams<TOnMutateResult> = {}) {
    return useMutation({
        mutationFn: addUserClient,
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
