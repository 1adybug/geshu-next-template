import { NextRequest, NextResponse } from "next/server"

import { verify } from "./server/verify"
import { cookieKey } from "./utils/cookieKey"

export const runtime = "nodejs"

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("current-url", request.url)

    const token = request.cookies.get(cookieKey("token"))?.value
    const id = verify(token)

    if (id) requestHeaders.set("current-user", id)

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    return response
}
