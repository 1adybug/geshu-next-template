import { z } from "zod/v4"

export const oidcClientSortBySchema = z.enum(["name", "clientId", "enabled", "createdAt", "updatedAt"], {
    message: "无效的排序字段",
})

export type OidcClientSortByParams = z.infer<typeof oidcClientSortBySchema>
