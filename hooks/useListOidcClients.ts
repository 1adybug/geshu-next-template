import { createRequestFn } from "deepsea-tools"
import { createUseQuery } from "soda-tanstack-query"

import { listOidcClientsAction } from "@/actions/listOidcClients"

export const listOidcClientsClient = createRequestFn({
    fn: listOidcClientsAction,
})

export const useListOidcClients = createUseQuery({
    queryFn: listOidcClientsClient,
    queryKey: "list-oidc-clients",
})
