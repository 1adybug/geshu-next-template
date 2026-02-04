"use server"

import { registerEmailPasswordSchema } from "@/schemas/registerEmailPassword"

import { createResponseFn } from "@/server/createResponseFn"

import { registerEmailPassword } from "@/shared/registerEmailPassword"

export const registerEmailPasswordAction = createResponseFn({
    fn: registerEmailPassword,
    schema: registerEmailPasswordSchema,
    name: "registerEmailPassword",
})
