import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { getUserOwnAction } from "@/actions/getUserOwn"

export const getUserOwnClient = createRequestFn(getUserOwnAction)

export function useGetUserOwn() {
    return useQuery({
        queryKey: ["get-user-own"],
        queryFn: getUserOwnClient,
    })
}
