"use server"

import { listConnectedApps } from "@/shared/listConnectedApps"

import { createResponseFn } from "@/utils/createResponseFn"

export const listConnectedAppsAction = createResponseFn({
    fn: listConnectedApps,
    name: "listConnectedApps",
})
