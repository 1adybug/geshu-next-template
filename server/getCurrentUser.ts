import { prisma } from "@/prisma"
import { defaultUserSelect } from "@/prisma/getUserSelect"

import { getCurrentUserId } from "./getCurrentUserId"

export async function getCurrentUser() {
    const id = await getCurrentUserId()
    if (!id) return undefined
    const user = await prisma.user.findUnique({ where: { id }, select: defaultUserSelect })
    return user || undefined
}
