import { getParser } from "."
import { z } from "zod/v4"

import { oidcClientPatchSchema } from "./oidcClientPatch"

export const updateOidcClientSchema = z.object(
    {
        client_id: z.string({ message: "无效的 client_id" }).trim().min(1, { message: "无效的 client_id" }),
        patch: oidcClientPatchSchema,
    },
    { message: "无效的更新参数" },
)

export type UpdateOidcClientParams = z.infer<typeof updateOidcClientSchema>

export const updateOidcClientParser = getParser(updateOidcClientSchema)
