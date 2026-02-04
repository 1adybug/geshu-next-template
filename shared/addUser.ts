import { prisma } from "@/prisma"

import { AddUserParams } from "@/schemas/addUser"

import { auth } from "@/server/auth"
import { getTempEmail } from "@/server/getTempEmail"
import { isAdmin } from "@/server/isAdmin"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function addUser({ name, email, phoneNumber, password, role }: AddUserParams) {
    const { enableEmailPassword, enableEmailOtp, enablePhonePassword, enablePhoneOtp } = await getSystemConfig()

    const mustEmail = !enablePhonePassword && !enablePhoneOtp
    const mustPhone = !enableEmailPassword && !enableEmailOtp
    const mustPassword = !enableEmailOtp && !enablePhoneOtp

    if (mustEmail && !email) throw new ClientError("邮箱不能为空")
    if (mustPhone && !phoneNumber) throw new ClientError("手机号不能为空")
    if (mustPassword && !password) throw new ClientError("密码不能为空")

    email ??= getTempEmail()

    const count = await prisma.user.count({ where: { email: email } })
    if (count > 0) throw new ClientError("邮箱已被注册")

    if (phoneNumber) {
        const count2 = await prisma.user.count({ where: { phoneNumber } })
        if (count2 > 0) throw new ClientError("手机号已被注册")
    }

    const { user } = await auth.api.createUser({
        body: {
            name,
            email,
            password: password ?? undefined,
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
