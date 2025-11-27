import { getParser } from "."
import { z } from "zod/v4"

import { createdAfterSchema } from "./createdAfter"
import { createdBeforeSchema } from "./createdBefore"
import { oidcClientSortBySchema } from "./oidcClientSortBy"
import { defaultPageNum, pageNumSchema } from "./pageNum"
import { defaultPageSize, pageSizeSchema } from "./pageSize"
import { sortOrderSchema } from "./sortOrder"
import { updatedAfterSchema } from "./updatedAfter"
import { updatedBeforeSchema } from "./updatedBefore"

export const queryOidcClientSchema = z.object(
    {
        name: z.string().trim().default("").optional(),
        clientId: z.string().trim().default("").optional(),
        enabled: z.boolean().optional(),
        createdBefore: createdBeforeSchema.optional(),
        createdAfter: createdAfterSchema.optional(),
        updatedBefore: updatedBeforeSchema.optional(),
        updatedAfter: updatedAfterSchema.optional(),
        pageNum: pageNumSchema.default(defaultPageNum).optional(),
        pageSize: pageSizeSchema.default(defaultPageSize).optional(),
        sortBy: oidcClientSortBySchema.default("updatedAt").optional(),
        sortOrder: sortOrderSchema.default("desc").optional(),
    },
    { message: "无效的查询参数" },
)

export type QueryOidcClientParams = z.infer<typeof queryOidcClientSchema>

export const queryOidcClientParser = getParser(queryOidcClientSchema)
