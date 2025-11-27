"use server"

import { deleteOidcClient } from "@/shared/deleteOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const deleteOidcClientAction = createResponseFn({
    fn: deleteOidcClient,
    name: "deleteOidcClient",
})
