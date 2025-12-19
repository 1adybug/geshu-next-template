import { useQuery } from "@tanstack/react-query"
import { createRequestFn, isNonNullable } from "deepsea-tools"

import { getOidcClientAction } from "@/actions/getOidcClient"

import { GetOidcClientParams, getOidcClientSchema } from "@/schemas/getOidcClient"

export const getOidcClientClient = createRequestFn({
    fn: getOidcClientAction,
    schema: getOidcClientSchema,
})

export interface UseGetOidcClientParams {
    client_id?: string
    enabled?: boolean
}

export function useGetOidcClient(idOrParams?: UseGetOidcClientParams) {
    const { client_id, enabled = true } = typeof idOrParams === "object" ? idOrParams : { client_id: idOrParams }
    const params: GetOidcClientParams | undefined = isNonNullable(client_id) ? { client_id } : undefined

    return useQuery({
        queryKey: ["get-oidc-client", client_id],
        queryFn: () => (params ? getOidcClientClient(params) : null),
        enabled,
    })
}
