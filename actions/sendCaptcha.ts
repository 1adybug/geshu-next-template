"use server"

import { accountSchema } from "@/schemas/account"
import { sendCaptcha } from "@/shared/sendCaptcha"
import { createResponseFn } from "@/utils/createResponseFn"

export const sendCaptchaAction = createResponseFn({
    fn: sendCaptcha,
    schema: accountSchema,
    name: "sendCaptcha",
})
