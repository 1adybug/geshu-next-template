"use server"

import { createFirstUserSchema } from "@/schemas/createFirstUser"

import { createFirstUser } from "@/shared/createFirstUser"

import { createResponseFn } from "@/utils/createResponseFn"

export const createFirstUserAction = createResponseFn({
    fn: createFirstUser,
    schema: createFirstUserSchema,
    name: "createFirstUser",
})
