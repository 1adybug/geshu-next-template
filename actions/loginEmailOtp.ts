"use server"

import { loginEmailOtpSchema } from "@/schemas/loginEmailOtp"

import { createResponseFn } from "@/server/createResponseFn"

import { loginEmailOtp } from "@/shared/loginEmailOtp"

export const loginEmailOtpAction = createResponseFn({
    fn: loginEmailOtp,
    schema: loginEmailOtpSchema,
    name: "loginEmailOtp",
})
