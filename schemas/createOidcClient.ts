import { getParser } from "."
import { z } from "zod/v4"

import { oidcClientSchema } from "./oidcClient"

export const createOidcClientSchema = oidcClientSchema

export type CreateOidcClientParams = z.infer<typeof createOidcClientSchema>

export const createOidcClientParser = getParser(createOidcClientSchema)
