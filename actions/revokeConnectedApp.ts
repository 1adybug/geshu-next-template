"use server"

import { revokeConnectedAppSchema } from "@/schemas/revokeConnectedApp"

import { revokeConnectedApp } from "@/shared/revokeConnectedApp"

import { createResponseFn } from "@/utils/createResponseFn"

export const revokeConnectedAppAction = createResponseFn({
    fn: revokeConnectedApp,
    schema: revokeConnectedAppSchema,
    name: "revokeConnectedApp",
})
