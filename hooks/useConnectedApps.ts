import { useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query"

import { request } from "@/utils/request"

export interface ConnectedApp {
    client_id: string
    client_name?: string
    scopes: string[]
    createdAt: string
    updatedAt: string
}

export function useQueryConnectedApps() {
    return useQuery({
        queryKey: ["query-connected-apps"],
        queryFn: () => request<ConnectedApp[]>("/api/account/connected-apps", { method: "GET" }),
    })
}

export interface RevokeConnectedAppParams {
    client_id: string
}

export interface UseRevokeConnectedAppParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<{ success: true }, Error, RevokeConnectedAppParams, TOnMutateResult>,
    "mutationFn"
> {}

export function useRevokeConnectedApp<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseRevokeConnectedAppParams<TOnMutateResult> = {}) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ client_id }: RevokeConnectedAppParams) =>
            request<{ success: true }>(`/api/account/connected-apps/${encodeURIComponent(client_id)}`, { method: "DELETE" }),
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.invalidateQueries({ queryKey: ["query-connected-apps"] })
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
