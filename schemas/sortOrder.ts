import { getParser } from "."
import { z } from "zod"

export const sortOrderSchema = z.enum(["asc", "desc"], { message: "无效的排序方向" })

export type SortOrderParams = z.infer<typeof sortOrderSchema>

export const SortOrderParser = getParser(sortOrderSchema)
