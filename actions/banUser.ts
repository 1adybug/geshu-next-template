"use server"

import { banUserSchema } from "@/schemas/banUser"

import { createResponseFn } from "@/server/createResponseFn"

import { banUser } from "@/shared/banUser"

export const banUserAction = createResponseFn({
    fn: banUser,
    schema: banUserSchema,
    name: "banUser",
})
