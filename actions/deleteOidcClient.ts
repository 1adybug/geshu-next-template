"use server"

import { deleteOidcClientSchema } from "@/schemas/deleteOidcClient"

import { createResponseFn } from "@/server/createResponseFn"

import { deleteOidcClient } from "@/shared/deleteOidcClient"

export const deleteOidcClientAction = createResponseFn({
    fn: deleteOidcClient,
    schema: deleteOidcClientSchema,
    name: "deleteOidcClient",
})
