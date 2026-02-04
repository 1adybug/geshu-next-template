"use server"

import { registerPhonePasswordSchema } from "@/schemas/registerPhonePassword"

import { createResponseFn } from "@/server/createResponseFn"

import { registerPhonePassword } from "@/shared/registerPhonePassword"

export const registerPhonePasswordAction = createResponseFn({
    fn: registerPhonePassword,
    schema: registerPhonePasswordSchema,
    name: "registerPhonePassword",
})
