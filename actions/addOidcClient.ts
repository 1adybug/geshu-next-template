"use server"

import { addOidcClientSchema } from "@/schemas/addOidcClient"

import { addOidcClient } from "@/shared/addOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const addOidcClientAction = createResponseFn({
    fn: addOidcClient,
    schema: addOidcClientSchema,
    name: "addOidcClient",
})
