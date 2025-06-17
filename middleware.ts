import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("current-url", request.url)

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    return response
}
