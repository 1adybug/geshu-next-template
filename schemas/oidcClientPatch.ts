import { getParser } from "."
import { z } from "zod/v4"

import { oidcClientSchema } from "./oidcClient"

export const oidcClientPatchSchema = oidcClientSchema
    .omit({
        client_id: true,
    })
    .partial()

export type OidcClientPatchParams = z.infer<typeof oidcClientPatchSchema>

export const oidcClientPatchParser = getParser(oidcClientPatchSchema)
