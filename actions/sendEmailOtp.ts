"use server"

import { sendEmailOtpSchema } from "@/schemas/sendEmailOtp"

import { createResponseFn } from "@/server/createResponseFn"

import { sendEmailOtp } from "@/shared/sendEmailOtp"

export const sendEmailOtpAction = createResponseFn({
    fn: sendEmailOtp,
    schema: sendEmailOtpSchema,
    name: "sendEmailOtp",
})
