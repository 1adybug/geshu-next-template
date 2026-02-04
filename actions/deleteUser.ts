"use server"

import { userIdSchema } from "@/schemas/userId"

import { createResponseFn } from "@/server/createResponseFn"

import { deleteUser } from "@/shared/deleteUser"

export const deleteUserAction = createResponseFn({
    fn: deleteUser,
    schema: userIdSchema,
    name: "deleteUser",
})
