import { createRequestFn } from "deepsea-tools"
import { createUseQuery } from "soda-tanstack-query"

import { getSystemConfigAction } from "@/actions/getSystemConfig"

export const getSystemConfigClient = createRequestFn({
    fn: getSystemConfigAction,
})

export const useGetSystemConfig = createUseQuery({
    queryFn: getSystemConfigClient,
    queryKey: "get-system-config",
})
