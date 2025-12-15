import { getParser } from "."
import { z } from "zod/v4"

export const revokeConnectedAppSchema = z.object(
    {
        client_id: z.string({ message: "无效的 client_id" }).trim().min(1, { message: "无效的 client_id" }),
    },
    { message: "无效的请求参数" },
)

export type RevokeConnectedAppParams = z.infer<typeof revokeConnectedAppSchema>

export const revokeConnectedAppParser = getParser(revokeConnectedAppSchema)
