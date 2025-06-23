import { ZodType, z } from "zod"

import { ClientError } from "@/utils/clientError"

export function getParser<T extends ZodType<any, any, any>>(schema: T) {
    return function parser(arg: unknown): z.infer<T> {
        const { data, error } = schema.safeParse(arg)
        if (error)
            throw new ClientError({
                message: error.errors.map(e => e.message).join(", "),
                origin: error,
            })
        return data
    }
}
