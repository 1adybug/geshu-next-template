"use server"

import { sendPhoneOtpSchema } from "@/schemas/sendPhoneOtp"

import { createResponseFn } from "@/server/createResponseFn"

import { sendPhoneOtp } from "@/shared/sendPhoneOtp"

export const sendPhoneOtpAction = createResponseFn({
    fn: sendPhoneOtp,
    schema: sendPhoneOtpSchema,
    name: "sendPhoneOtp",
})
