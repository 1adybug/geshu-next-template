import { prisma } from "@/prisma"

import { AccountParams } from "@/schemas/account"
import { phoneNumberRegex } from "@/schemas/phoneNumber"

import { auth } from "@/server/auth"

import { ClientError } from "@/utils/clientError"

export interface SendPhoneNumberOtpResponse {
    phoneNumber: string
}

export async function sendPhoneNumberOtp(params: AccountParams): Promise<SendPhoneNumberOtpResponse> {
    const user = await prisma.user.findUnique({
        where: phoneNumberRegex.test(params) ? { phoneNumber: params } : { name: params },
    })

    if (!user) throw new ClientError("用户名或手机号不存在")

    try {
        await auth.api.sendPhoneNumberOTP({
            body: {
                phoneNumber: user.phoneNumber,
            },
        })
    } catch (error) {
        throw new ClientError({
            message: "发送验证码失败",
            origin: error,
        })
    }

    return {
        phoneNumber: user.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
    }
}

sendPhoneNumberOtp.filter = false
