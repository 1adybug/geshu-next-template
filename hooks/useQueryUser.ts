import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { queryUserAction } from "@/actions/queryUser"

import { QueryUserParams, queryUserSchema } from "@/schemas/queryUser"

export const queryUserClient = createRequestFn({
    fn: queryUserAction,
    schema: queryUserSchema,
})

export function useQueryUser(params: QueryUserParams = {}) {
    return useQuery({
        queryKey: ["query-user", params],
        queryFn: () => queryUserClient(params),
    })
}
