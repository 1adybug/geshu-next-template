import { getParser } from "."
import { z } from "zod/v4"

export const oidcClientSchema = z.object({
    client_id: z.string().trim().min(1),
    client_secret: z.string().trim().min(1).optional(),
    redirect_uris: z.array(z.string().trim().min(1)),
    grant_types: z.array(z.string().trim().min(1)).default(["authorization_code", "refresh_token"]),
    response_types: z.array(z.string().trim().min(1)).default(["code"]),
    scope: z.string().trim().min(1).optional(),
    token_endpoint_auth_method: z.string().trim().min(1).optional(),
    application_type: z.string().trim().min(1).optional(),
    client_name: z.string().trim().min(1).optional(),
    is_first_party: z.boolean().optional(),
})

export type OidcClientParams = z.infer<typeof oidcClientSchema>

export const oidcClientParser = getParser(oidcClientSchema)
