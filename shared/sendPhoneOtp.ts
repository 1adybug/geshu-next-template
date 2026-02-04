import { IsDevelopment } from "@/constants"

import { prisma } from "@/prisma"

import { SendPhoneOtpParams } from "@/schemas/sendPhoneOtp"

import { auth } from "@/server/auth"
import { createAuthRequest } from "@/server/createAuthRequest"
import { getDevOtp } from "@/server/devOtpStore"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

function maskPhone(phone: string) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
}

export async function sendPhoneOtp(params: SendPhoneOtpParams) {
    const { enablePhoneOtp, allowRegister } = await getSystemConfig()

    if (!enablePhoneOtp) throw new ClientError("未启用手机号验证码登录")

    const phoneNumber = params.phoneNumber.trim()

    if (!allowRegister) {
        const user = await prisma.user.findUnique({ where: { phoneNumber } })
        if (!user) throw new ClientError("未开放注册")
    }

    const { headers, request } = await createAuthRequest({
        method: "POST",
        path: "/phone-number/send-otp",
    })

    await auth.api.sendPhoneNumberOTP({
        body: {
            phoneNumber,
        },
        headers,
        request,
    })

    const masked = maskPhone(phoneNumber)
    const devOtp = IsDevelopment ? getDevOtp(`phone:${phoneNumber}`) : undefined

    if (devOtp) return `${masked}（开发环境验证码：${devOtp}）`

    return masked
}

sendPhoneOtp.filter = false
