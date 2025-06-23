import { prisma } from "@/prisma"
import { User } from "@/prisma/generated"

import { AddUserParams } from "@/schemas/addUser"

import { ClientError } from "@/utils/clientError"

export async function addUser({ username, phone }: AddUserParams) {
    const count = await prisma.user.count({ where: { username } })
    if (count > 0) throw new ClientError("用户名已存在")
    const count2 = await prisma.user.count({ where: { phone } })
    if (count2 > 0) throw new ClientError("手机号已存在")
    const user = await prisma.user.create({ data: { username, phone } })
    return user
}

addUser.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
