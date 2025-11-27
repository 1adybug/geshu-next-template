"use server"

import { oidcClientUtils } from "@/shared/oidcClientUtils"

import { createResponseFn } from "@/utils/createResponseFn"

export const oidcClientUtilsAction = createResponseFn({
    fn: oidcClientUtils,
    name: "oidcClientUtils",
})
