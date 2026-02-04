"use server"

import { registerEmailOtpSchema } from "@/schemas/registerEmailOtp"

import { createResponseFn } from "@/server/createResponseFn"

import { registerEmailOtp } from "@/shared/registerEmailOtp"

export const registerEmailOtpAction = createResponseFn({
    fn: registerEmailOtp,
    schema: registerEmailOtpSchema,
    name: "registerEmailOtp",
})
