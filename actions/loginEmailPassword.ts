"use server"

import { loginEmailPasswordSchema } from "@/schemas/loginEmailPassword"

import { createResponseFn } from "@/server/createResponseFn"

import { loginEmailPassword } from "@/shared/loginEmailPassword"

export const loginEmailPasswordAction = createResponseFn({
    fn: loginEmailPassword,
    schema: loginEmailPasswordSchema,
    name: "loginEmailPassword",
})
