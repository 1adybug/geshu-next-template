import { NextRequest, NextResponse } from "next/server"

function getCanonicalOrigin() {
    const base = process.env.NEXTAUTH_URL?.trim() || process.env.OIDC_ISSUER?.trim()
    if (!base) return undefined

    try {
        return new URL(base).origin
    } catch {
        return undefined
    }
}

function getRequestOrigin(request: NextRequest) {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.trim()
    const forwardedHost = request.headers.get("x-forwarded-host")?.trim()
    const host = forwardedHost || request.headers.get("host")?.trim()
    const proto = forwardedProto || request.nextUrl.protocol.replace(":", "")
    if (!host) return request.nextUrl.origin
    return `${proto}://${host}`
}

export async function proxy(request: NextRequest) {
    const method = request.method?.toUpperCase()
    const isSafeMethod = method === "GET" || method === "HEAD"

    // Dev-only canonical host redirect:
    // If you open the site via `0.0.0.0` / LAN IP but `NEXTAUTH_URL` is `localhost`,
    // next-auth will redirect to `localhost` and the state cookie becomes "missing"
    // (because it was set on a different host), causing `error=OAuthCallback`.
    const canonicalOrigin = isSafeMethod && process.env.NODE_ENV !== "production" ? getCanonicalOrigin() : undefined
    const requestOrigin = canonicalOrigin ? getRequestOrigin(request) : undefined

    if (canonicalOrigin && requestOrigin && requestOrigin !== canonicalOrigin) {
        const redirectUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, canonicalOrigin)
        if (redirectUrl.toString() !== request.url) return NextResponse.redirect(redirectUrl, 307)
    }

    if (!isSafeMethod) return NextResponse.next()

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("current-url", request.url)

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
