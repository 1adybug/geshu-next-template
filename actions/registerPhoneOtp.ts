"use server"

import { registerPhoneOtpSchema } from "@/schemas/registerPhoneOtp"

import { createResponseFn } from "@/server/createResponseFn"

import { registerPhoneOtp } from "@/shared/registerPhoneOtp"

export const registerPhoneOtpAction = createResponseFn({
    fn: registerPhoneOtp,
    schema: registerPhoneOtpSchema,
    name: "registerPhoneOtp",
})
