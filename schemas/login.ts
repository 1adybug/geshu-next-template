import { getParser } from "."
import { z } from "zod"

import { accountSchema } from "./account"
import { captchaSchema } from "./captcha"

export const loginSchema = z.object({
    account: accountSchema,
    captcha: captchaSchema,
})

export type LoginParams = z.infer<typeof loginSchema>

export const loginParser = getParser(loginSchema)
