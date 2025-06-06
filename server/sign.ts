import jwt from "jsonwebtoken"

import { JWT_SECRET } from "@/constants"

export function sign(id: string) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" })
}
