import { getParser } from "."
import { z } from "zod"

export const updatedBeforeSchema = z.date({ message: "无效的更新时间" })

export type UpdatedBeforeParams = z.infer<typeof updatedBeforeSchema>

export const updatedBeforeParser = getParser(updatedBeforeSchema)
