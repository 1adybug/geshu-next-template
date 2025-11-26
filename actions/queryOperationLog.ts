"use server"

import { queryOperationLogSchema } from "@/schemas/queryOperationLog"

import { queryOperationLog } from "@/shared/queryOperationLog"

import { createResponseFn } from "@/utils/createResponseFn"

export const queryOperationLogAction = createResponseFn({
    fn: queryOperationLog,
    schema: queryOperationLogSchema,
    name: "queryOperationLog",
})
