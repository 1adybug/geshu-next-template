import { getParser } from "."
import { z } from "zod"

import { phoneNumberSchema } from "./phoneNumber"

export const userPhoneNumberSchema = z
    .union([
        z
            .string({ message: "无效的手机号" })
            .trim()
            .length(0, { message: "无效的手机号" })
            .transform(() => null),
        phoneNumberSchema,
    ])
    .nullable()

export type UserPhoneNumberParams = z.infer<typeof userPhoneNumberSchema>

export const userPhoneNumberParser = getParser(userPhoneNumberSchema)
