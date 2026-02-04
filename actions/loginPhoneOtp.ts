"use server"

import { loginPhoneOtpSchema } from "@/schemas/loginPhoneOtp"

import { createResponseFn } from "@/server/createResponseFn"

import { loginPhoneOtp } from "@/shared/loginPhoneOtp"

export const loginPhoneOtpAction = createResponseFn({
    fn: loginPhoneOtp,
    schema: loginPhoneOtpSchema,
    name: "loginPhoneOtp",
})
