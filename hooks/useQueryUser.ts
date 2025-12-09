import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { queryUserAction } from "@/actions/queryUser"

import { QueryUserParams } from "@/schemas/queryUser"

export const queryUserClient = createRequestFn(queryUserAction)

export function useQueryUser(params: QueryUserParams) {
    return useQuery({
        queryKey: ["query-user", params],
        queryFn: () => queryUserClient(params),
    })
}
