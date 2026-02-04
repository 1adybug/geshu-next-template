import { getParser } from "."
import { z } from "zod/v4"

import { emailSchema } from "./email"
import { passwordSchema } from "./password"
import { phoneNumberSchema } from "./phoneNumber"
import { usernameSchema } from "./username"

export const createFirstUserSchema = z.object(
    {
        name: usernameSchema,
        email: emailSchema,
        phoneNumber: phoneNumberSchema,
        password: passwordSchema,
    },
    { message: "无效的用户参数" },
)

export type CreateFirstUserParams = z.infer<typeof createFirstUserSchema>

export const createFirstUserParser = getParser(createFirstUserSchema)
