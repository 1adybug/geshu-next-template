import { getParser } from "."
import { z } from "zod"

export const phoneRegex = /^1[3-9]\d{9}$/

export const phoneSchema = z.string({ message: "无效的手机号" }).regex(phoneRegex, { message: "无效的手机号" })

export type PhoneParams = z.infer<typeof phoneSchema>

export const phoneParser = getParser(phoneSchema)
