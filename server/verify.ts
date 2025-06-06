import jwt from "jsonwebtoken"

import { JWT_SECRET } from "@/constants"

interface Decoded {
    id: string
}

export async function verify(token: unknown): Promise<string | undefined> {
    if (typeof token !== "string") return undefined
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as Decoded
        return decoded.id
    } catch (error) {
        return undefined
    }
}
