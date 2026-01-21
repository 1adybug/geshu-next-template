import { createRequestFn, isNonNullable } from "deepsea-tools"
import { createUseQuery } from "soda-tanstack-query"

import { getOidcClientAction } from "@/actions/getOidcClient"

import { getOidcClientSchema } from "@/schemas/getOidcClient"

export const getOidcClientClient = createRequestFn({
    fn: getOidcClientAction,
    schema: getOidcClientSchema,
})

export function getOidcClientClientOptional(client_id?: string | undefined) {
    return isNonNullable(client_id) ? getOidcClientClient({ client_id }) : null
}

export const useGetOidcClient = createUseQuery({
    queryFn: getOidcClientClientOptional,
    queryKey: "get-oidc-client",
})
