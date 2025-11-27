import { getParser } from "."
import { z } from "zod/v4"

import { DefaultGrantTypes, DefaultResponseTypes } from "@/constants/oidc"

import {
    descriptionSchema,
    grantTypesSchema,
    redirectUrisSchema,
    responseTypesSchema,
    scopeSchema,
    tokenEndpointAuthMethodSchema,
    uriListSchema,
} from "./oidcClient"

export const addOidcClientSchema = z.object(
    {
        name: z.string({ required_error: "请输入名称" }).trim().min(1, { message: "请输入名称" }).max(64, { message: "名称过长" }),
        description: descriptionSchema,
        redirectUris: redirectUrisSchema,
        postLogoutRedirectUris: uriListSchema,
        grantTypes: grantTypesSchema.default(DefaultGrantTypes.join(" ")),
        responseTypes: responseTypesSchema.default(DefaultResponseTypes.join(" ")),
        scope: scopeSchema,
        tokenEndpointAuthMethod: tokenEndpointAuthMethodSchema,
        enabled: z
            .boolean()
            .optional()
            .transform(value => value ?? true),
    },
    { message: "无效的客户端参数" },
)

export type AddOidcClientParams = z.infer<typeof addOidcClientSchema>

export const addOidcClientParser = getParser(addOidcClientSchema)
