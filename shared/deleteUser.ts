import { headers } from "next/headers"

import { prisma } from "@/prisma"

import { UserIdParams } from "@/schemas/userId"

import { auth } from "@/server/auth"
import { isAdmin } from "@/server/isAdmin"

import { ClientError } from "@/utils/clientError"

export async function deleteUser(id: UserIdParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError("用户不存在")
    const count = await prisma.user.count({ where: { role: "admin" } })
    if (count === 1 && user.role === "admin") throw new ClientError("不能删除最后一个管理员")

    try {
        await auth.api.removeUser({
            body: {
                userId: id,
            },
            headers: await headers(),
        })

        return user
    } catch (error) {
        throw new ClientError({
            message: "删除用户失败",
            origin: error,
        })
    }
}

deleteUser.filter = isAdmin
