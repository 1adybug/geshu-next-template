import type { NextApiRequest, NextApiResponse } from "next"
import NextAuth from "next-auth"

import { getAuthOptions } from "@/server/authOptions"

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
    await NextAuth(req, res, getAuthOptions())
}
