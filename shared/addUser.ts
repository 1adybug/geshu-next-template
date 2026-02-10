import { prisma } from "@/prisma"

import { AddUserParams } from "@/schemas/addUser"

import { auth } from "@/server/auth"
import { getRandomPassword } from "@/server/getRandomPassword"
import { getTempEmail } from "@/server/getTempEmail"
import { isAdmin } from "@/server/isAdmin"

import { ClientError } from "@/utils/clientError"

export async function addUser({ name, phoneNumber, role }: AddUserParams) {
    const phoneNumberCount = await prisma.user.count({ where: { phoneNumber } })
    if (phoneNumberCount > 0) throw new ClientError("手机号已被注册")

    const email = getTempEmail(phoneNumber)
    const emailCount = await prisma.user.count({ where: { email: email } })
    if (emailCount > 0) throw new ClientError("邮箱已被注册")

    const { user } = await auth.api.createUser({
        body: {
            name,
            email,
            password: getRandomPassword(),
            role,
            data: {
                phoneNumber,
            },
        },
    })

    if (!user) throw new ClientError("新增用户失败")

    return user
}

addUser.filter = isAdmin
