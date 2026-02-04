import { prisma } from "@/prisma"

import { UserIdParams } from "@/schemas/userId"

import { isAdmin } from "@/server/isAdmin"

import { ClientError } from "@/utils/clientError"

export async function getUser(id: UserIdParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError("用户不存在")
    return user
}

getUser.filter = isAdmin
