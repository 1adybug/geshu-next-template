"use server"

import { createResponseFn } from "@/server/createResponseFn"

import { register } from "@/shared/register"

export const registerAction = createResponseFn({
    fn: register,
    name: "register",
})
