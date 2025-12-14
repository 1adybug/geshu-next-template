import { NextResponse } from "next/server"

import { getEnv } from "@/server/env"
import { clearLocalUserCookie } from "@/server/session"

export const runtime = "nodejs"

export async function GET() {
    const env = getEnv()
    const response = NextResponse.redirect(env.APP_URL, 302)
    clearLocalUserCookie(response)
    return response
}
