import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { queryErrorLogAction } from "@/actions/queryErrorLog"

import { QueryErrorLogParams, queryErrorLogSchema } from "@/schemas/queryErrorLog"

export const queryErrorLogClient = createRequestFn({
    fn: queryErrorLogAction,
    schema: queryErrorLogSchema,
})

export function useQueryErrorLog(params: QueryErrorLogParams = {}) {
    return useQuery({
        queryKey: ["query-error-log", params],
        queryFn: () => queryErrorLogClient(params),
    })
}
