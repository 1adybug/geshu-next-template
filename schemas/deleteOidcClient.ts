import { getParser } from "."
import { z } from "zod/v4"

export const deleteOidcClientSchema = z.object(
    {
        client_id: z.string({ message: "无效的 client_id" }).trim().min(1, { message: "无效的 client_id" }),
    },
    { message: "无效的请求参数" },
)

export type DeleteOidcClientParams = z.infer<typeof deleteOidcClientSchema>

export const deleteOidcClientParser = getParser(deleteOidcClientSchema)
