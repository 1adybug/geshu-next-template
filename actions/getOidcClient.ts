"use server"

import { getOidcClientSchema } from "@/schemas/getOidcClient"

import { createResponseFn } from "@/server/createResponseFn"

import { getOidcClient } from "@/shared/getOidcClient"

export const getOidcClientAction = createResponseFn({
    fn: getOidcClient,
    schema: getOidcClientSchema,
    name: "getOidcClient",
})
