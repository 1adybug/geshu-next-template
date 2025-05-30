import { z } from "zod"

import { ClientError } from "@/utils/clientError"

export function getParser<T>(schema: z.ZodType<T>) {
    return function parser(arg: unknown): T {
        const { data, error } = schema.safeParse(arg)
        if (error)
            throw new ClientError({
                message: error.errors.map(e => e.message).join(", "),
                origin: error,
            })
        return data
    }
}
