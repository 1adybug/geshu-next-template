import { NextResponse } from "next/server"

import { getEnv } from "@/server/env"
import { clearSessionCookie } from "@/server/session"

export const runtime = "nodejs"

export async function GET() {
    const env = getEnv()
    const response = NextResponse.redirect(env.APP_URL, 302)
    clearSessionCookie(response)
    return response
}
