"use server"

import { queryErrorLogSchema } from "@/schemas/queryErrorLog"

import { queryErrorLog } from "@/shared/queryErrorLog"

import { createResponseFn } from "@/utils/createResponseFn"

export const queryErrorLogAction = createResponseFn({
    fn: queryErrorLog,
    schema: queryErrorLogSchema,
    name: "queryErrorLog",
})
