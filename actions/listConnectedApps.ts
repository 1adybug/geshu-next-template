"use server"

import { createResponseFn } from "@/server/createResponseFn"

import { listConnectedApps } from "@/shared/listConnectedApps"

export const listConnectedAppsAction = createResponseFn({
    fn: listConnectedApps,
    name: "listConnectedApps",
})
