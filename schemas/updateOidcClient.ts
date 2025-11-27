import { getParser } from "."
import { z } from "zod/v4"

import { addOidcClientSchema } from "./addOidcClient"
import { idSchema } from "./id"

export const updateOidcClientSchema = addOidcClientSchema.extend({
    id: idSchema,
})

export interface UpdateOidcClientParams extends z.infer<typeof updateOidcClientSchema> {}

export const updateOidcClientParser = getParser(updateOidcClientSchema)
