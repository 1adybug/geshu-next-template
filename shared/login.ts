import { prisma } from "@/prisma"

import { LoginParams } from "@/schemas/login"
import { phoneNumberRegex } from "@/schemas/phoneNumber"

import { auth } from "@/server/auth"

import { ClientError } from "@/utils/clientError"

export async function login({ account, otp }: LoginParams) {
    const user = await prisma.user.findUnique({
        where: phoneNumberRegex.test(account) ? { phoneNumber: account } : { name: account },
    })

    if (!user) throw new ClientError("账号或验证码错误")

    try {
        await auth.api.verifyPhoneNumber({
            body: {
                phoneNumber: user.phoneNumber,
                code: otp,
            },
        })
    } catch (error) {
        throw new ClientError({
            message: "账号或验证码错误",
            origin: error,
        })
    }

    return user
}

login.filter = false
