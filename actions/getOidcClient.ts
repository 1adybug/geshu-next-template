"use server"

import { getOidcClientSchema } from "@/schemas/getOidcClient"

import { getOidcClient } from "@/shared/getOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const getOidcClientAction = createResponseFn({
    fn: getOidcClient,
    schema: getOidcClientSchema,
    name: "getOidcClient",
})
