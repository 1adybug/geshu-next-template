"use server"

import { queryUser } from "@/shared/queryUser"
import { createResponseFn } from "@/utils/createResponseFn"

export const queryUserAction = createResponseFn(queryUser)
