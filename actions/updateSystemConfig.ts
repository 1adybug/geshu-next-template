"use server"

import { systemConfigSchema } from "@/schemas/systemConfig"

import { createResponseFn } from "@/server/createResponseFn"

import { updateSystemConfig } from "@/shared/updateSystemConfig"

export const updateSystemConfigAction = createResponseFn({
    fn: updateSystemConfig,
    schema: systemConfigSchema,
    name: "updateSystemConfig",
})
