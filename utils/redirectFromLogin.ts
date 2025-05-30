import { redirect } from "next/navigation"

import { LoginPathname } from "@/constants"

import { getPathnameAndSearchParams } from "./getPathnameAndSearchParams"

export function redirectFromLogin(url: string) {
    const { pathname, searchParams } = getPathnameAndSearchParams(url)
    if (pathname !== LoginPathname) return redirect(pathname)
    const from = searchParams.get("from")?.trim()
    if (!from) return redirect("/")
    const { pathname: fromPathname, searchParams: fromSearchParams } = getPathnameAndSearchParams(from)
    return redirect(`${fromPathname}${fromSearchParams.size > 0 ? `?${fromSearchParams.toString()}` : ""}`)
}
