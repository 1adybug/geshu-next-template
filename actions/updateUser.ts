"use server"

import { updateUserSchema } from "@/schemas/updateUser"

import { updateUser } from "@/shared/updateUser"

import { createResponseFn } from "@/utils/createResponseFn"

export const updateUserAction = createResponseFn({
    fn: updateUser,
    schema: updateUserSchema,
    name: "updateUser",
})
