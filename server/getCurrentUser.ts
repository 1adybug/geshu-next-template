import { headers } from "next/headers"

import { prisma } from "@/prisma"

export async function getCurrentUser() {
    const headersList = await headers()
    const id = headersList.get("current-user")
    if (!id) return undefined
    const user = await prisma.user.findUnique({ where: { id } })
    return user || undefined
}
