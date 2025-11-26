import { getParser } from "."
import { z } from "zod"

import { phoneSchema } from "./phone"

import { usernameSchema } from "./username"

export const createFirstUserSchema = z.object(
    {
        username: usernameSchema,
        phone: phoneSchema,
    },
    { message: "无效的创建用户参数" },
)

export type CreateFirstUserParams = z.infer<typeof createFirstUserSchema>

export const createFirstUserParser = getParser(createFirstUserSchema)
