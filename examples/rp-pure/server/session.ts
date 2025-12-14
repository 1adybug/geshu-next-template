import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export interface AuthFlowCookie {
    codeVerifier: string
    state: string
}

export interface SessionCookie {
    sub: string
    scope: string
    access_token: string
    refresh_token?: string
    expires_at?: number
}

const AuthFlowCookieName = "rp_auth_flow"
const SessionCookieName = "rp_session"

function serialize(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString("base64url")
}

function parse<T>(value?: string) {
    if (!value) return undefined

    try {
        return JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as T
    } catch {
        return undefined
    }
}

export async function getAuthFlowCookie() {
    const value = (await cookies()).get(AuthFlowCookieName)?.value
    return parse<AuthFlowCookie>(value)
}

export function setAuthFlowCookie(response: NextResponse, value: AuthFlowCookie) {
    response.cookies.set(AuthFlowCookieName, serialize(value), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 60,
    })
}

export function clearAuthFlowCookie(response: NextResponse) {
    response.cookies.set(AuthFlowCookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
}

export async function getSession() {
    const value = (await cookies()).get(SessionCookieName)?.value
    return parse<SessionCookie>(value)
}

export function setSessionCookie(response: NextResponse, value: SessionCookie) {
    response.cookies.set(SessionCookieName, serialize(value), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
    })
}

export function clearSessionCookie(response: NextResponse) {
    response.cookies.set(SessionCookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
}
