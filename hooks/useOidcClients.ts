import { useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query"

import { OidcClientParams } from "@/schemas/oidcClient"

import { request } from "@/utils/request"

export interface OidcClientRecord {
    client_id: string
    client_secret: string
    redirect_uris: string[]
    grant_types: string[]
    response_types: string[]
    scope?: string
    token_endpoint_auth_method?: string
    application_type?: string
    client_name?: string
    is_first_party: boolean
    createdAt: string
    updatedAt: string
}

export function useQueryOidcClients() {
    return useQuery({
        queryKey: ["query-oidc-clients"],
        queryFn: () => request<OidcClientRecord[]>("/api/admin/oidc/clients", { method: "GET" }),
    })
}

export interface GetOidcClientParams {
    client_id?: string
    enabled?: boolean
}

export function useGetOidcClient({ client_id, enabled }: GetOidcClientParams) {
    const id = client_id?.trim()
    return useQuery({
        queryKey: ["get-oidc-client", id],
        enabled: !!id && enabled !== false,
        queryFn: () => request<OidcClientRecord>(`/api/admin/oidc/clients/${encodeURIComponent(id!)}`, { method: "GET" }),
    })
}

export interface UseCreateOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<OidcClientRecord, Error, OidcClientParams, TOnMutateResult>,
    "mutationFn"
> {}

export function useCreateOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseCreateOidcClientParams<TOnMutateResult> = {}) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: OidcClientParams) => request<OidcClientRecord>("/api/admin/oidc/clients", { body }),
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.invalidateQueries({ queryKey: ["query-oidc-clients"] })
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

export interface UpdateOidcClientParams {
    client_id: string
    patch: Partial<OidcClientParams>
}

export interface UseUpdateOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<OidcClientRecord, Error, UpdateOidcClientParams, TOnMutateResult>,
    "mutationFn"
> {}

export function useUpdateOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseUpdateOidcClientParams<TOnMutateResult> = {}) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ client_id, patch }: UpdateOidcClientParams) =>
            request<OidcClientRecord>(`/api/admin/oidc/clients/${encodeURIComponent(client_id)}`, { method: "PUT", body: patch }),
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.invalidateQueries({ queryKey: ["query-oidc-clients"] })
            queryClient.invalidateQueries({ queryKey: ["get-oidc-client", variables.client_id] })
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

export interface DeleteOidcClientParams {
    client_id: string
}

export interface UseDeleteOidcClientParams<TOnMutateResult = unknown> extends Omit<
    UseMutationOptions<{ success: true }, Error, DeleteOidcClientParams, TOnMutateResult>,
    "mutationFn"
> {}

export function useDeleteOidcClient<TOnMutateResult = unknown>({
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...rest
}: UseDeleteOidcClientParams<TOnMutateResult> = {}) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ client_id }: DeleteOidcClientParams) =>
            request<{ success: true }>(`/api/admin/oidc/clients/${encodeURIComponent(client_id)}`, { method: "DELETE" }),
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TOnMutateResult | Promise<TOnMutateResult>
        },
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.invalidateQueries({ queryKey: ["query-oidc-clients"] })
            queryClient.invalidateQueries({ queryKey: ["get-oidc-client", variables.client_id] })
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
