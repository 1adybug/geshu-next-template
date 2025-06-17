"use server"

import { addUserSchema } from "@/schemas/addUser"
import { addUser } from "@/shared/addUser"
import { createResponseFn } from "@/utils/createResponseFn"

export const addUserAction = createResponseFn(addUserSchema, addUser)
