import { getParser } from "."
import { z } from "zod"

export const loginSchema = z.object({
    username: z.string({ message: "无效的用户名" }),
    password: z.string({ message: "无效的密码" }),
})

export type LoginParams = z.infer<typeof loginSchema>

export const loginParser = getParser(loginSchema)
