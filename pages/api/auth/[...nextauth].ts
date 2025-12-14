import type { NextApiRequest, NextApiResponse } from "next"
import NextAuth from "next-auth"

import { getAuthOptions } from "@/server/authOptions"

export default async function auth(request: NextApiRequest, response: NextApiResponse) {
    await NextAuth(request, response, getAuthOptions())
}
