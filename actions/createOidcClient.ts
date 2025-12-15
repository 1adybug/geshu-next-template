"use server"

import { createOidcClientSchema } from "@/schemas/createOidcClient"

import { createResponseFn } from "@/server/createResponseFn"

import { createOidcClient } from "@/shared/createOidcClient"

export const createOidcClientAction = createResponseFn({
    fn: createOidcClient,
    schema: createOidcClientSchema,
    name: "createOidcClient",
})
