import { IsDevelopment } from "@/constants"

import { prisma } from "@/prisma"

import { SendEmailOtpParams, sendEmailOtpParser } from "@/schemas/sendEmailOtp"

import { auth } from "@/server/auth"
import { createAuthRequest } from "@/server/createAuthRequest"
import { getDevOtp } from "@/server/devOtpStore"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

function maskEmail(email: string) {
    const [name, domain] = email.split("@")
    if (!domain) return email
    if (!name) return `***@${domain}`
    const safeName = name.length <= 2 ? `${name[0]}*` : `${name[0]}***${name[name.length - 1]}`
    return `${safeName}@${domain}`
}

export async function sendEmailOtp(params: SendEmailOtpParams) {
    params = sendEmailOtpParser(params)

    const config = await getSystemConfig()

    if (!config.enableEmailOtp) throw new ClientError("未启用邮箱验证码登录")

    const email = params.email.trim().toLowerCase()

    if (!config.allowRegister) {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new ClientError("未开放注册")
    }

    const { headers, request } = await createAuthRequest({
        method: "POST",
        path: "/email-otp/send-verification-otp",
    })

    await auth.api.sendVerificationOTP({
        body: {
            email,
            type: "sign-in",
        },
        headers,
        request,
    })

    const masked = maskEmail(email)
    const devOtp = IsDevelopment ? getDevOtp(`email:${email}:sign-in`) : undefined

    if (devOtp) return `${masked}（开发环境验证码：${devOtp}）`

    return masked
}

sendEmailOtp.filter = false
