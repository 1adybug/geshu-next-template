import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export interface AuthFlowCookie {
    codeVerifier: string
    state: string
}

export interface LocalUserCookie {
    localUserId: string
}

export interface PendingLinkCookie {
    issuer: string
    sub: string
}

const AuthFlowCookieName = "rp_auth_flow"
const LocalUserCookieName = "rp_local_user"
const PendingLinkCookieName = "rp_pending_link"

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

export async function getLocalUserCookie() {
    const value = (await cookies()).get(LocalUserCookieName)?.value
    return parse<LocalUserCookie>(value)
}

export function setLocalUserCookie(response: NextResponse, value: LocalUserCookie) {
    response.cookies.set(LocalUserCookieName, serialize(value), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
    })
}

export function clearLocalUserCookie(response: NextResponse) {
    response.cookies.set(LocalUserCookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
}

export async function getPendingLinkCookie() {
    const value = (await cookies()).get(PendingLinkCookieName)?.value
    return parse<PendingLinkCookie>(value)
}

export function setPendingLinkCookie(response: NextResponse, value: PendingLinkCookie) {
    response.cookies.set(PendingLinkCookieName, serialize(value), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 60,
    })
}

export function clearPendingLinkCookie(response: NextResponse) {
    response.cookies.set(PendingLinkCookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
}
