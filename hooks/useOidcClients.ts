import { useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query"

import { OidcClientParams } from "@/schemas/oidcClient"

export interface OidcClientRecord {
    client_id: string
    client_secret: string
    redirect_uris: string[]
    grant_types: string[]
    response_types: string[]
    scope?: string | null
    token_endpoint_auth_method?: string | null
    application_type?: string | null
    client_name?: string | null
    is_first_party: boolean
    createdAt: string
    updatedAt: string
}

async function readJson<T>(res: Response): Promise<T> {
    return (await res.json().catch(() => undefined)) as T
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
        ...init,
        headers: {
            ...(init?.headers || {}),
            accept: "application/json",
        },
    })

    if (!res.ok) {
        const data = await readJson<{ message?: string }>(res)
        throw new Error(data?.message || `请求失败(${res.status})`)
    }

    return (await readJson<T>(res)) as T
}

export function useQueryOidcClients() {
    return useQuery({
        queryKey: ["oidc-clients"],
        queryFn: () => request<OidcClientRecord[]>("/api/admin/oidc/clients"),
    })
}

export function useGetOidcClient(params: { client_id?: string; enabled?: boolean }) {
    const client_id = params.client_id?.trim()
    return useQuery({
        queryKey: ["oidc-client", client_id],
        enabled: !!client_id && params.enabled !== false,
        queryFn: () => request<OidcClientRecord>(`/api/admin/oidc/clients/${encodeURIComponent(client_id!)}`),
    })
}

export interface UseCreateOidcClientParams<TContext = unknown> extends Omit<
    UseMutationOptions<OidcClientRecord, Error, OidcClientParams, TContext>,
    "mutationFn"
> {}

export function useCreateOidcClient<TContext = unknown>(params: UseCreateOidcClientParams<TContext> = {}) {
    const queryClient = useQueryClient()
    const { onMutate, onSuccess, onError, onSettled, ...rest } = params
    return useMutation({
        mutationFn: (body: OidcClientParams) =>
            request<OidcClientRecord>("/api/admin/oidc/clients", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(body),
            }),
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TContext | Promise<TContext>
        },
        onSuccess(...args) {
            const [data] = args
            queryClient.invalidateQueries({ queryKey: ["oidc-clients"] })
            return (onSuccess as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args) ?? data
        },
        onError(...args) {
            return (onError as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args)
        },
        onSettled(...args) {
            return (onSettled as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args)
        },
        ...rest,
    })
}

export interface UseUpdateOidcClientParams<TContext = unknown> extends Omit<
    UseMutationOptions<OidcClientRecord, Error, { client_id: string; patch: Partial<OidcClientParams> }, TContext>,
    "mutationFn"
> {}

export function useUpdateOidcClient<TContext = unknown>(params: UseUpdateOidcClientParams<TContext> = {}) {
    const queryClient = useQueryClient()
    const { onMutate, onSuccess, onError, onSettled, ...rest } = params
    return useMutation({
        mutationFn: ({ client_id, patch }: { client_id: string; patch: Partial<OidcClientParams> }) =>
            request<OidcClientRecord>(`/api/admin/oidc/clients/${encodeURIComponent(client_id)}`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(patch),
            }),
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TContext | Promise<TContext>
        },
        onSuccess(...args) {
            const [data, variables] = args as [OidcClientRecord, { client_id: string; patch: Partial<OidcClientParams> }, unknown, unknown]
            queryClient.invalidateQueries({ queryKey: ["oidc-clients"] })
            queryClient.invalidateQueries({ queryKey: ["oidc-client", variables.client_id] })
            return (onSuccess as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args) ?? data
        },
        onError(...args) {
            return (onError as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args)
        },
        onSettled(...args) {
            return (onSettled as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args)
        },
        ...rest,
    })
}

export interface UseDeleteOidcClientParams<TContext = unknown> extends Omit<
    UseMutationOptions<{ success: true }, Error, { client_id: string }, TContext>,
    "mutationFn"
> {}

export function useDeleteOidcClient<TContext = unknown>(params: UseDeleteOidcClientParams<TContext> = {}) {
    const queryClient = useQueryClient()
    const { onMutate, onSuccess, onError, onSettled, ...rest } = params
    return useMutation({
        mutationFn: ({ client_id }: { client_id: string }) =>
            request<{ success: true }>(`/api/admin/oidc/clients/${encodeURIComponent(client_id)}`, { method: "DELETE" }),
        onMutate(variables, context) {
            return onMutate?.(variables, context) as TContext | Promise<TContext>
        },
        onSuccess(...args) {
            const [data, variables] = args as [{ success: true }, { client_id: string }, unknown, unknown]
            queryClient.invalidateQueries({ queryKey: ["oidc-clients"] })
            queryClient.invalidateQueries({ queryKey: ["oidc-client", variables.client_id] })
            return (onSuccess as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args) ?? data
        },
        onError(...args) {
            return (onError as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args)
        },
        onSettled(...args) {
            return (onSettled as unknown as ((...a: unknown[]) => unknown) | undefined)?.(...args)
        },
        ...rest,
    })
}
