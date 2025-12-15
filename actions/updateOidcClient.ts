"use server"

import { updateOidcClientSchema } from "@/schemas/updateOidcClient"

import { createResponseFn } from "@/server/createResponseFn"

import { updateOidcClient } from "@/shared/updateOidcClient"

export const updateOidcClientAction = createResponseFn({
    fn: updateOidcClient,
    schema: updateOidcClientSchema,
    name: "updateOidcClient",
})
