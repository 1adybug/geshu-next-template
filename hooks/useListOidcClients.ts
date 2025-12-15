import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { listOidcClientsAction } from "@/actions/listOidcClients"

export const listOidcClientsClient = createRequestFn(listOidcClientsAction)

export interface UseListOidcClientsParams {
    enabled?: boolean
}

export function useListOidcClients(params: UseListOidcClientsParams = {}) {
    const { enabled = true } = params

    return useQuery({
        queryKey: ["list-oidc-clients"],
        queryFn: () => listOidcClientsClient(),
        enabled,
    })
}
