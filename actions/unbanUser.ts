"use server"

import { userIdSchema } from "@/schemas/userId"

import { createResponseFn } from "@/server/createResponseFn"

import { unbanUser } from "@/shared/unbanUser"

export const unbanUserAction = createResponseFn({
    fn: unbanUser,
    schema: userIdSchema,
    name: "unbanUser",
})
