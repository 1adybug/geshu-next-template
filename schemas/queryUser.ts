import { getParser } from "."
import { z } from "zod"

import { createdAfterSchema } from "./createdAfter"
import { createdBeforeSchema } from "./createdBefore"
import { pageNumSchema } from "./pageNum"
import { pageSizeSchema } from "./pageSize"
import { updatedAfterSchema } from "./updatedAfter"
import { updatedBeforeSchema } from "./updatedBefore"

export const queryUserSchema = z.object(
    {
        username: z.string({ message: "无效的用户名" }).optional(),
        phone: z.string({ message: "无效的手机号" }).optional(),
        createdBefore: createdBeforeSchema.optional(),
        createdAfter: createdAfterSchema.optional(),
        updatedBefore: updatedBeforeSchema.optional(),
        updatedAfter: updatedAfterSchema.optional(),
        pageNum: pageNumSchema.optional(),
        pageSize: pageSizeSchema.optional(),
    },
    {
        message: "无效的查询参数",
    },
)

export type QueryUserParams = z.infer<typeof queryUserSchema>

export const queryUserParser = getParser(queryUserSchema)
