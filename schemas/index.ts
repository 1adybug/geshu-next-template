import { $ZodType, flattenError, output, safeParse } from "zod/v4/core"

import { ClientError } from "@/utils/clientError"

export function getParser<T extends $ZodType>(schema: T) {
    return function parser(arg: unknown): output<T> {
        const { data, error } = safeParse(schema, arg)
        if (error)
            throw new ClientError({
                message: flattenError(error).formErrors.join(", "),
                origin: error,
            })
        return data
    }
}
