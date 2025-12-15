"use server"

import { revokeConnectedAppSchema } from "@/schemas/revokeConnectedApp"

import { createResponseFn } from "@/server/createResponseFn"

import { revokeConnectedApp } from "@/shared/revokeConnectedApp"

export const revokeConnectedAppAction = createResponseFn({
    fn: revokeConnectedApp,
    schema: revokeConnectedAppSchema,
    name: "revokeConnectedApp",
})
