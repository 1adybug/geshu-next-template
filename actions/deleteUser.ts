"use server"

import { deleteUser } from "@/shared/deleteUser"
import { createResponseFn } from "@/utils/createResponseFn"

export const deleteUserAction = createResponseFn(deleteUser)
