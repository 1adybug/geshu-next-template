import { prisma } from "@/prisma"

import { UpdateUserParams } from "@/schemas/updateUser"

import { ClientError } from "@/utils/clientError"

export async function updateUser({ id, username, phone }: UpdateUserParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError("用户不存在")
    const count = await prisma.user.count({ where: { username, id: { not: id } } })
    if (count > 0) throw new ClientError("用户名已存在")
    const count2 = await prisma.user.count({ where: { phone, id: { not: id } } })
    if (count2 > 0) throw new ClientError("手机号已存在")
    const response = await prisma.user.update({ where: { id }, data: { username, phone } })
    return response
}
