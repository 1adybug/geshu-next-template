import { getParser } from "."
import { z } from "zod"

import { Role } from "@/prisma/generated"

export { Role } from "@/prisma/generated"

export const roleSchema = z.nativeEnum(Role, { message: "无效的角色" })

export type RoleParams = z.infer<typeof roleSchema>

export const RoleNames: Record<Role, string> = {
    ADMIN: "管理员",
    USER: "用户",
}

export const roleParser = getParser(roleSchema)
