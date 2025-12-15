import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { queryOperationLogAction } from "@/actions/queryOperationLog"

import { QueryOperationLogParams } from "@/schemas/queryOperationLog"

export const queryOperationLogClient = createRequestFn(queryOperationLogAction)

export function useQueryOperationLog(params: QueryOperationLogParams = {}) {
    return useQuery({
        queryKey: ["query-operation-log", params],
        queryFn: () => queryOperationLogClient(params),
    })
}
