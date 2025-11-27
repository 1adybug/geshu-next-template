"use server"

import { queryOidcClientSchema } from "@/schemas/queryOidcClient"

import { queryOidcClient } from "@/shared/queryOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const queryOidcClientAction = createResponseFn({
    fn: queryOidcClient,
    schema: queryOidcClientSchema,
    name: "queryOidcClient",
})
