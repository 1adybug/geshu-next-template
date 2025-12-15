"use server"

import { updateOidcClientSchema } from "@/schemas/updateOidcClient"

import { updateOidcClient } from "@/shared/updateOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const updateOidcClientAction = createResponseFn({
    fn: updateOidcClient,
    schema: updateOidcClientSchema,
    name: "updateOidcClient",
})
