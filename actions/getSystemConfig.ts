"use server"

import { createResponseFn } from "@/server/createResponseFn"

import { getSystemConfig } from "@/shared/getSystemConfig"

export const getSystemConfigAction = createResponseFn({
    fn: getSystemConfig,
    name: "getSystemConfig",
})
