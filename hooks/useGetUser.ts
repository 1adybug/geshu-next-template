import { useQuery } from "@tanstack/react-query"
import { createRequestFn, isNonNullable } from "deepsea-tools"

import { getUserAction } from "@/actions/getUser"

export const getUserClient = createRequestFn(getUserAction)

export interface UseGetUserParams {
    id?: string
    enabled?: boolean
}

export function useGetUser(idOrParams?: UseGetUserParams) {
    const { id, enabled } = typeof idOrParams === "object" ? idOrParams : { id: idOrParams }

    return useQuery({
        queryKey: ["use-get-user", id],
        queryFn: () => (isNonNullable(id) ? getUserClient(id) : null),
        enabled,
    })
}
