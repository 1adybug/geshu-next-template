"use server"

import { userIdSchema } from "@/schemas/userId"

import { createResponseFn } from "@/server/createResponseFn"

import { getUser } from "@/shared/getUser"

export const getUserAction = createResponseFn({
    fn: getUser,
    schema: userIdSchema,
    name: "getUser",
})
