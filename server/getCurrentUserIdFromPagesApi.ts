import type { NextApiRequest } from "next"
import { getToken } from "next-auth/jwt"

function getSecret() {
    const secret = process.env.NEXTAUTH_SECRET?.trim()
    if (!secret) throw new Error("Missing env NEXTAUTH_SECRET")
    return secret
}

export async function getCurrentUserIdFromPagesApiRequest(req: NextApiRequest) {
    const token = await getToken({ req, secret: getSecret() })
    const userId = typeof token?.sub === "string" ? token.sub : undefined
    return userId
}
