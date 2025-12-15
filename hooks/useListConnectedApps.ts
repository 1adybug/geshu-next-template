import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { listConnectedAppsAction } from "@/actions/listConnectedApps"

export const listConnectedAppsClient = createRequestFn(listConnectedAppsAction)

export interface UseListConnectedAppsParams {
    enabled?: boolean
}

export function useListConnectedApps(params: UseListConnectedAppsParams = {}) {
    const { enabled = true } = params

    return useQuery({
        queryKey: ["list-connected-apps"],
        queryFn: () => listConnectedAppsClient(),
        enabled,
    })
}
