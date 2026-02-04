import { prisma } from "@/prisma"

import { UserIdParams } from "@/schemas/userId"

import { isAdmin } from "@/server/isAdmin"

import { ClientError } from "@/utils/clientError"

export async function deleteUser(id: UserIdParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError("用户不存在")
    const count = await prisma.user.count({ where: { role: "admin" } })
    if (count === 1 && user.role === "admin") throw new ClientError("不能删除最后一个管理员")

    const user2 = await prisma.user.delete({ where: { id } })
    return user2
}

deleteUser.filter = isAdmin
