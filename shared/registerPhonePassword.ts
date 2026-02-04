import { prisma } from "@/prisma"

import { RegisterPhonePasswordParams } from "@/schemas/registerPhonePassword"
import { UserRole } from "@/schemas/userRole"

import { auth } from "@/server/auth"
import { getTempEmail } from "@/server/getTempEmail"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function registerPhonePassword({ name, phoneNumber, password }: RegisterPhonePasswordParams) {
    const { enablePhonePassword, allowRegister } = await getSystemConfig()

    if (!enablePhonePassword) throw new ClientError("未启用手机号密码登录")
    if (!allowRegister) throw new ClientError("未开放注册")

    const email = getTempEmail()

    const emailCount = await prisma.user.count({ where: { email } })
    if (emailCount > 0) throw new ClientError("邮箱已被注册")

    const phoneCount = await prisma.user.count({ where: { phoneNumber } })
    if (phoneCount > 0) throw new ClientError("手机号已被注册")

    const { user } = await auth.api.createUser({
        body: {
            name,
            email,
            password,
            role: UserRole.用户,
            data: {
                phoneNumber,
            },
        },
    })

    return user
}

registerPhonePassword.filter = false
