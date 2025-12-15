"use server"

import { listOidcClients } from "@/shared/listOidcClients"

import { createResponseFn } from "@/utils/createResponseFn"

export const listOidcClientsAction = createResponseFn({
    fn: listOidcClients,
    name: "listOidcClients",
})
