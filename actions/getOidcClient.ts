"use server"

import { getOidcClient } from "@/shared/getOidcClient"

import { createResponseFn } from "@/utils/createResponseFn"

export const getOidcClientAction = createResponseFn({
    fn: getOidcClient,
    name: "getOidcClient",
})
