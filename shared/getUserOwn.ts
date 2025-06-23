import { prisma } from "@/prisma"

import { getCurrentUserId } from "@/server/getCurrentUserId"

export async function getUserOwn() {
    const id = await getCurrentUserId()
    const user = await prisma.user.findUnique({
        where: { id },
    })
    if (!user) throw new Error("用户不存在")
    return user
}
