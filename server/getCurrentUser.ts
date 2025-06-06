import { prisma } from "@/prisma"

import { getUserId } from "./getUserId"

export async function getCurrentUser() {
    const id = await getUserId()
    if (!id) return undefined
    const user = await prisma.user.findUnique({ where: { id } })
    return user || undefined
}
