import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { queryErrorLogAction } from "@/actions/queryErrorLog"

import { QueryErrorLogParams } from "@/schemas/queryErrorLog"

export const queryErrorLogClient = createRequestFn(queryErrorLogAction)

export function useQueryErrorLog(params: QueryErrorLogParams = {}) {
    return useQuery({
        queryKey: ["query-error-log", params],
        queryFn: () => queryErrorLogClient(params),
    })
}
