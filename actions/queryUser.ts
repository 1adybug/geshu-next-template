"use server"

import { queryUserSchema } from "@/schemas/queryUser"

import { queryUser } from "@/shared/queryUser"

import { createResponseFn } from "@/utils/createResponseFn"

export const queryUserAction = createResponseFn({
    fn: queryUser,
    schema: queryUserSchema,
    name: "queryUser",
})
