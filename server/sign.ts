import { SignJWT } from "jose"

import { JWT_SECRET } from "@/constants"

export async function sign(id: string) {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({ id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1 day").sign(secretKey)
    return token
}
