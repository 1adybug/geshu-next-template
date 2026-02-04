import { headers } from "next/headers"

import { PublicApiUrl } from "@/constants"

export interface CreateAuthRequestParams {
    method?: string
    path?: string
    headers?: HeadersInit
}

export interface AuthRequestContext {
    headers: Headers
    request: Request
}

function resolveOrigin(values: Headers) {
    const originHeader = values.get("origin") || values.get("referer")

    if (originHeader) {
        try {
            return new URL(originHeader).origin
        } catch {
            return originHeader
        }
    }

    const baseUrl = PublicApiUrl ? PublicApiUrl.trim() : ""

    if (baseUrl) {
        try {
            return new URL(baseUrl).origin
        } catch {
            return baseUrl
        }
    }

    const forwardedProto = values.get("x-forwarded-proto") || "http"
    const forwardedHost = values.get("x-forwarded-host") || values.get("host")

    if (forwardedHost) return `${forwardedProto}://${forwardedHost}`

    return "http://localhost:3000"
}

function joinAuthPath(pathname?: string) {
    if (!pathname) return "/api/auth"
    if (pathname.startsWith("/api/auth")) return pathname
    if (pathname.startsWith("/")) return `/api/auth${pathname}`
    return `/api/auth/${pathname}`
}

export async function createAuthRequest({ method = "POST", path, headers: extraHeaders }: CreateAuthRequestParams = {}): Promise<AuthRequestContext> {
    const headerStore = await headers()
    const nextHeaders = new Headers(headerStore)

    if (extraHeaders) {
        const extra = new Headers(extraHeaders)
        extra.forEach((value, key) => nextHeaders.set(key, value))
    }

    const origin = resolveOrigin(nextHeaders)

    nextHeaders.set("origin", origin)
    nextHeaders.set("referer", origin)

    const url = new URL(joinAuthPath(path), origin)
    const request = new Request(url, { method, headers: nextHeaders })

    return {
        headers: nextHeaders,
        request,
    }
}
