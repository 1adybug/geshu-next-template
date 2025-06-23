"use server"

import { getUserOwn } from "@/shared/getUserOwn"
import { createResponseFn } from "@/utils/createResponseFn"

export const getUserOwnAction = createResponseFn(getUserOwn)
