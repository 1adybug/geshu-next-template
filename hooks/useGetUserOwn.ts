import { createRequestFn } from "deepsea-tools"
import { createUseQuery } from "soda-tanstack-query"

import { getUserOwnAction } from "@/actions/getUserOwn"

export const getUserOwnClient = createRequestFn(getUserOwnAction)

export const useGetUserOwn = createUseQuery({
    queryFn: getUserOwnClient,
    queryKey: "get-user-own",
})
