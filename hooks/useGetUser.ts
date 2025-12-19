import { useQuery } from "@tanstack/react-query"
import { createRequestFn, isNonNullable } from "deepsea-tools"

import { getUserAction } from "@/actions/getUser"

import { idSchema } from "@/schemas/id"

export const getUserClient = createRequestFn({
    fn: getUserAction,
    schema: idSchema,
})

export interface UseGetUserParams {
    id?: string | undefined
    enabled?: boolean
}

export function useGetUser(idOrParams?: UseGetUserParams | string | undefined) {
    const { id, enabled = true } = typeof idOrParams === "object" ? idOrParams : { id: idOrParams, enabled: true }

    return useQuery({
        queryKey: ["get-user", id],
        queryFn: () => (isNonNullable(id) ? getUserClient(id) : null),
        enabled,
    })
}
