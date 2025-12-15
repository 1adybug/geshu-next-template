"use server"

import { createResponseFn } from "@/server/createResponseFn"

import { listOidcClients } from "@/shared/listOidcClients"

export const listOidcClientsAction = createResponseFn({
    fn: listOidcClients,
    name: "listOidcClients",
})
