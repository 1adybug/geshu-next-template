import { redirect } from "next/navigation"

import { LoginPathname } from "@/constants"

import { getPathnameAndSearchParams } from "./getPathnameAndSearchParams"

export function redirectToLogin(url: string) {
    const { pathname, searchParams } = getPathnameAndSearchParams(url)
    if (pathname === LoginPathname) return redirect(LoginPathname)
    return redirect(`${LoginPathname}?from=${encodeURIComponent(`${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ""}`)}`)
}
