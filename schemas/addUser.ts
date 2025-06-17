import { getParser } from "."
import { z } from "zod"

import { phoneSchema } from "./phone"
import { usernameSchema } from "./username"

export const addUserSchema = z.object(
    {
        username: usernameSchema,
        phone: phoneSchema,
    },
    { message: "无效的用户参数" },
)

export type AddUserParams = z.infer<typeof addUserSchema>

export const addUserParser = getParser(addUserSchema)
