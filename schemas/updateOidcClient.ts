import { getParser } from "."
import { z } from "zod/v4"

import { addOidcClientSchema } from "./addOidcClient"
import { idSchema } from "./id"

export const updateOidcClientSchema = addOidcClientSchema.extend(
    {
        id: idSchema,
    },
    { message: "无效的客户端参数" },
)

export type UpdateOidcClientParams = z.infer<typeof updateOidcClientSchema>

export const updateOidcClientParser = getParser(updateOidcClientSchema)
