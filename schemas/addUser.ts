import { getParser } from "."
import { z } from "zod/v4"

import { userEmailSchema } from "./userEmail"
import { usernameSchema } from "./username"
import { userPasswordSchema } from "./userPassword"
import { userPhoneNumberSchema } from "./userPhoneNumber"
import { UserRoleSchema } from "./userRole"

export const addUserSchema = z.object(
    {
        name: usernameSchema,
        email: userEmailSchema.optional(),
        phoneNumber: userPhoneNumberSchema.optional(),
        password: userPasswordSchema.optional(),
        role: UserRoleSchema,
    },
    { message: "无效的用户参数" },
)

export type AddUserParams = z.infer<typeof addUserSchema>

export const addUserParser = getParser(addUserSchema)
