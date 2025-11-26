"use server"

import { loginSchema } from "@/schemas/login"

import { login } from "@/shared/login"

import { createResponseFn } from "@/utils/createResponseFn"

export const loginAction = createResponseFn({
    fn: login,
    schema: loginSchema,
    name: "login",
})
