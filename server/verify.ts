import jwt from "jsonwebtoken"

import { JWT_SECRET } from "@/constants"

interface Payload {
    id: string
}

export function verify(token: unknown): string | undefined {
    if (typeof token !== "string") return undefined
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as Payload
        return decoded.id
    } catch (error) {
        return undefined
    }
}
