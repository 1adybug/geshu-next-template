import { getParser } from "."
import { z } from "zod"

import { addUserSchema } from "./addUser"
import { idSchema } from "./id"

export const updateUserSchema = addUserSchema.merge(
    z.object({
        id: idSchema,
    }),
)

export type UpdateUserParams = z.infer<typeof updateUserSchema>

export const updateUserParser = getParser(updateUserSchema)
