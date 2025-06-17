import { prisma } from "@/prisma"

import { IdParams } from "@/schemas/id"

import { ClientError } from "@/utils/clientError"

export async function getUser(id: IdParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError("用户不存在")
    return user
}
