import { prisma } from "@/prisma"

import { AccountParams } from "@/schemas/account"
import { phoneNumberRegex } from "@/schemas/phoneNumber"

import { auth } from "@/server/auth"

export interface SendPhoneNumberOtpResponse {
    message: string
    phoneNumber: string
}

export async function sendPhoneNumberOtp(params: AccountParams): Promise<SendPhoneNumberOtpResponse> {
    const user = await prisma.user.findUnique({
        where: phoneNumberRegex.test(params) ? { phoneNumber: params } : { name: params },
    })

    if (!user) throw new Error("用户名或手机号不存在")

    const result = await auth.api.sendPhoneNumberOTP({
        body: {
            phoneNumber: user.phoneNumber,
        },
    })

    return {
        message: result.message,
        phoneNumber: user.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
    }
}

sendPhoneNumberOtp.filter = false
