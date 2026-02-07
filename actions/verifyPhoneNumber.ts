"use server"

import { createResponseFn } from "@/server/createResponseFn"

import { verifyPhoneNumber } from "@/shared/verifyPhoneNumber"

export const verifyPhoneNumberAction = createResponseFn({
    fn: verifyPhoneNumber,
    name: "verifyPhoneNumber",
})
