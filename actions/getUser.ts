"use server"

import { idSchema } from "@/schemas/id"

import { getUser } from "@/shared/getUser"

import { createResponseFn } from "@/utils/createResponseFn"

export const getUserAction = createResponseFn({
    fn: getUser,
    schema: idSchema,
    name: "getUser",
})
