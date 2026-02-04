import { headers } from "next/headers"

import { prisma } from "@/prisma"

import { UpdateUserParams } from "@/schemas/updateUser"
import { UserRole } from "@/schemas/userRole"

import { auth } from "@/server/auth"
import { isAdmin } from "@/server/isAdmin"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function updateUser({ id, name, email, phoneNumber, password, role }: UpdateUserParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ClientError("用户不存在")

    const { enableEmailPassword, enableEmailOtp, enablePhonePassword, enablePhoneOtp } = await getSystemConfig()

    const mustEmail = !enablePhonePassword && !enablePhoneOtp
    const mustPhone = !enableEmailPassword && !enableEmailOtp
    const mustPassword = !enableEmailOtp && !enablePhoneOtp

    if (mustEmail && email === null) throw new ClientError("邮箱不能为空")
    if (mustPhone && phoneNumber === null) throw new ClientError("手机号不能为空")
    if (mustPassword && password === null) throw new ClientError("密码不能为空")

    if (email) {
        const count2 = await prisma.user.count({ where: { email: email, id: { not: id } } })
        if (count2 > 0) throw new ClientError("邮箱已存在")
    }

    if (phoneNumber) {
        const count3 = await prisma.user.count({ where: { phoneNumber: phoneNumber, id: { not: id } } })
        if (count3 > 0) throw new ClientError("手机号已存在")
    }

    if (role === UserRole.用户 && user.role === UserRole.管理员) {
        const count = await prisma.user.count({ where: { role: UserRole.管理员 } })
        if (count === 1) throw new ClientError("不能将最后一个管理员降级为普通用户")
    }

    const user2 = await auth.api.adminUpdateUser({
        body: {
            userId: id,
            data: {
                name,
                email,
                phoneNumber,
                password,
                role,
            },
        },
        headers: await headers(),
    })

    return user2
}

updateUser.filter = isAdmin
