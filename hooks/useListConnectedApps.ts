import { createRequestFn } from "deepsea-tools"
import { createUseQuery } from "soda-tanstack-query"

import { listConnectedAppsAction } from "@/actions/listConnectedApps"

export const listConnectedAppsClient = createRequestFn({
    fn: listConnectedAppsAction,
})

export const useListConnectedApps = createUseQuery({
    queryFn: listConnectedAppsClient,
    queryKey: "list-connected-apps",
})
