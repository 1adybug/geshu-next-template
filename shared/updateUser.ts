import { headers } from "next/headers"

import { prisma } from "@/prisma"

import { UpdateUserParams } from "@/schemas/updateUser"
import { UserRole } from "@/schemas/userRole"

import { auth } from "@/server/auth"
import { isAdmin } from "@/server/isAdmin"

import { ClientError } from "@/utils/clientError"

export async function updateUser({ id, name, phoneNumber, role }: UpdateUserParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError("用户不存在")

    const phoneNumberCount = await prisma.user.count({ where: { phoneNumber: phoneNumber, id: { not: id } } })
    if (phoneNumberCount > 0) throw new ClientError("手机号已存在")

    if (role === UserRole.用户 && user.role === UserRole.管理员) {
        const adminCount = await prisma.user.count({ where: { role: UserRole.管理员 } })
        if (adminCount === 1) throw new ClientError("不能将最后一个管理员降级为普通用户")
    }

    const user2 = await auth.api.adminUpdateUser({
        body: {
            userId: id,
            data: {
                name,
                phoneNumber,
                role,
            },
        },
        headers: await headers(),
    })

    return user2
}

updateUser.filter = isAdmin
