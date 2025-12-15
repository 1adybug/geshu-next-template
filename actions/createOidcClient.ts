"use server"

import { createOidcClientSchema } from "@/schemas/createOidcClient"

import { createOidcClient } from "@/shared/createOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const createOidcClientAction = createResponseFn({
    fn: createOidcClient,
    schema: createOidcClientSchema,
    name: "createOidcClient",
})
