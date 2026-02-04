"use server"

import { loginPhonePasswordSchema } from "@/schemas/loginPhonePassword"

import { createResponseFn } from "@/server/createResponseFn"

import { loginPhonePassword } from "@/shared/loginPhonePassword"

export const loginPhonePasswordAction = createResponseFn({
    fn: loginPhonePassword,
    schema: loginPhonePasswordSchema,
    name: "loginPhonePassword",
})
