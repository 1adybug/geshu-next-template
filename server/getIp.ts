import { headers } from "next/headers"

export async function getIp() {
    const headersList = await headers()
    return headersList.get("x-forwarded-for")!
}
