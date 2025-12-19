import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { queryOperationLogAction } from "@/actions/queryOperationLog"

import { QueryOperationLogParams, queryOperationLogSchema } from "@/schemas/queryOperationLog"

export const queryOperationLogClient = createRequestFn({
    fn: queryOperationLogAction,
    schema: queryOperationLogSchema,
})

export function useQueryOperationLog(params: QueryOperationLogParams = {}) {
    return useQuery({
        queryKey: ["query-operation-log", params],
        queryFn: () => queryOperationLogClient(params),
    })
}
