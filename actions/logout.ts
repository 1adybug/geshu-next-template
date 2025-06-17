"use server"

import { logout } from "@/shared/logout"
import { createResponseFn } from "@/utils/createResponseFn"

export const logoutAction = createResponseFn(logout)
