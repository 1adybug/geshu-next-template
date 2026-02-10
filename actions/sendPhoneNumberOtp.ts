"use server"

import { accountSchema } from "@/schemas/account"

import { createResponseFn } from "@/server/createResponseFn"

import { sendPhoneNumberOtp } from "@/shared/sendPhoneNumberOtp"

export const sendPhoneNumberOtpAction = createResponseFn({
    fn: sendPhoneNumberOtp,
    schema: accountSchema,
    name: "sendPhoneNumberOtp",
})
