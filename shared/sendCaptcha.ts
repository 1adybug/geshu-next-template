import { IsDevelopment } from "@/constants"

import { prisma } from "@/prisma"

import { AccountParams } from "@/schemas/account"

import { getUserFromAccount } from "@/server/getUserFromAccount"
import { sendMsg } from "@/server/sendMsg"

import { ClientError } from "@/utils/clientError"

export async function sendCaptcha(account: AccountParams) {
    const user = await getUserFromAccount(account)
    if (!user) throw new ClientError({ message: "用户不存在", code: 404 })
    const captcha = await prisma.captcha.findUnique({ where: { userId: user.id } })
    if (captcha && captcha.createdAt.valueOf() + 60 * 1000 > Date.now()) throw new ClientError({ message: "操作频繁，请稍后再试", code: 400 })
    const code = IsDevelopment ? "1234" : Math.random().toString().slice(2, 6).padEnd(4, "0")
    await sendMsg({ phone: user.phone, content: `您的验证码是：${code}` })
    await prisma.captcha.upsert({
        create: { userId: user.id, code, createdAt: new Date(), expiredAt: new Date(Date.now() + 60 * 1000) },
        update: { code, createdAt: new Date(), expiredAt: new Date(Date.now() + 60 * 1000) },
        where: { userId: user.id },
    })
    return user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
}

sendCaptcha.isAuthExempt = true
