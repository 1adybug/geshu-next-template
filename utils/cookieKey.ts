import { CookiePrefix } from "@/constants"

export function cookieKey(key: string) {
    return `${CookiePrefix ?? ""}${key}`
}
