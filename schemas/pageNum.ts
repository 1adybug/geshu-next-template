import { getParser } from "."
import { z } from "zod/v4"

export const pageNumSchema = z.number({ message: "无效的页码" }).int("页码必须是整数").min(1, "页码不能小于1")

export type PageNumParams = z.infer<typeof pageNumSchema>

export const pageNumParser = getParser(pageNumSchema)
