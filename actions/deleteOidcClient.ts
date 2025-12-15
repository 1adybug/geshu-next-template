"use server"

import { deleteOidcClientSchema } from "@/schemas/deleteOidcClient"

import { deleteOidcClient } from "@/shared/deleteOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const deleteOidcClientAction = createResponseFn({
    fn: deleteOidcClient,
    schema: deleteOidcClientSchema,
    name: "deleteOidcClient",
})
