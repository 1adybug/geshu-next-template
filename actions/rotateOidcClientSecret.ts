"use server"

import { rotateOidcClientSecret } from "@/shared/rotateOidcClientSecret"

import { createResponseFn } from "@/utils/createResponseFn"

export const rotateOidcClientSecretAction = createResponseFn({
    fn: rotateOidcClientSecret,
    name: "rotateOidcClientSecret",
})
