import { prisma } from "@/prisma"

import { getCurrentUserId } from "@/server/getCurrentUserId"

import { ClientError } from "@/utils/clientError"

export async function getUserOwn() {
    const id = await getCurrentUserId()
    if (!id) throw new ClientError({ message: "请先登录", code: 401 })
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError({ message: "用户不存在", code: 404 })
    return user
}
