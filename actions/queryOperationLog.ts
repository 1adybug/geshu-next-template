"use server"

import { queryOperationLog } from "@/shared/queryOperationLog"

import { createResponseFn } from "@/utils/createResponseFn"

export const queryOperationLogAction = createResponseFn({
    fn: queryOperationLog,
    name: "queryOperationLog",
})
