"use server"

import { createResponseFn } from "@/server/createResponseFn"

import { sendVerificationOtp } from "@/shared/sendVerificationOtp"

export const sendVerificationOtpAction = createResponseFn({
    fn: sendVerificationOtp,
    name: "sendVerificationOtp",
})
