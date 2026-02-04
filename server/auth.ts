import { APIError, betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"
import { emailOTP } from "better-auth/plugins/email-otp"
import { phoneNumber } from "better-auth/plugins/phone-number"

import { IsDevelopment, IsIntranet, IsProduction } from "@/constants"

import { prisma } from "@/prisma"

import { phoneNumberRegex } from "@/schemas/phoneNumber"

import { setDevOtp } from "@/server/devOtpStore"
import { getTempEmail } from "@/server/getTempEmail"
import { sendAliyunSms } from "@/server/sendAliyunSms"
import { sendQjpSms } from "@/server/sendQjpSms"

import { getSystemConfig } from "@/shared/getSystemConfig"

export const auth = betterAuth({
    baseURL: "http://localhost:3000",
    database: prismaAdapter(prisma, { provider: "sqlite" }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
    },
    emailVerification: {
        sendOnSignUp: true,
    },
    plugins: [
        admin(),
        phoneNumber({
            otpLength: 4,
            phoneNumberValidator(phoneNumber) {
                return phoneNumberRegex.test(phoneNumber)
            },
            sendOTP({ phoneNumber, code }) {
                setDevOtp(`phone:${phoneNumber}`, code)

                if (IsProduction) {
                    if (IsIntranet) {
                        sendQjpSms({
                            phone: phoneNumber,
                            content: `格数科技项目管理，你的登录验证码为 ${code}`,
                        })

                        return
                    }

                    sendAliyunSms({
                        phone: phoneNumber,
                        signName: "格数科技",
                        templateCode: "SMS_478995533",
                        params: { code },
                    })

                    return
                }
            },
            signUpOnVerification: {
                getTempEmail,
                getTempName(phoneNumber) {
                    return phoneNumber
                },
            },
        }),
        emailOTP({
            otpLength: 4,
            storeOTP: "plain",
            async sendVerificationOTP({ email, otp, type }) {
                setDevOtp(`email:${email}:${type}`, otp)
                if (IsDevelopment) console.log(`邮箱验证码(${type}): ${email} -> ${otp}`)
            },
        }),
        nextCookies(),
    ],
    databaseHooks: {
        user: {
            create: {},
        },
    },
    hooks: {
        before: createAuthMiddleware(async context => {
            const config = await getSystemConfig()
            if (context.path === "/sign-in/email" && !config.enableEmailPassword) throw new APIError("BAD_REQUEST", { message: "未启用邮箱密码登录" })

            if (context.path === "/sign-up/email") {
                if (!config.enableEmailPassword) throw new APIError("BAD_REQUEST", { message: "未启用邮箱密码登录" })

                if (!config.allowRegister) throw new APIError("FORBIDDEN", { message: "未开放注册" })
            }

            if (context.path === "/sign-in/email-otp" && !config.enableEmailOtp) throw new APIError("BAD_REQUEST", { message: "未启用邮箱验证码登录" })

            if (context.path === "/sign-in/email-otp") {
                const email = `${context.body?.email ?? ""}`.trim()
                if (!email) return
                const user = await prisma.user.findUnique({ where: { email } })
                if (!user && !config.allowRegister) throw new APIError("FORBIDDEN", { message: "未开放注册" })
            }

            if (context.path === "/email-otp/send-verification-otp") {
                if (!config.enableEmailOtp) throw new APIError("BAD_REQUEST", { message: "未启用邮箱验证码登录" })

                const email = `${context.body?.email ?? ""}`.trim()
                if (!email) return
                const user = await prisma.user.findUnique({ where: { email } })
                if (!user && !config.allowRegister) throw new APIError("FORBIDDEN", { message: "未开放注册" })
            }

            if (context.path === "/sign-in/phone-number" && !config.enablePhonePassword) throw new APIError("BAD_REQUEST", { message: "未启用手机号密码登录" })

            if (context.path === "/phone-number/send-otp") {
                if (!config.enablePhoneOtp) throw new APIError("BAD_REQUEST", { message: "未启用手机号验证码登录" })

                const phoneNumber = `${context.body?.phoneNumber ?? ""}`.trim()
                if (!phoneNumber) return
                const user = await prisma.user.findUnique({ where: { phoneNumber: phoneNumber } })
                if (!user && !config.allowRegister) throw new APIError("FORBIDDEN", { message: "未开放注册" })
            }

            if (context.path === "/phone-number/verify") {
                if (!config.enablePhoneOtp) throw new APIError("BAD_REQUEST", { message: "未启用手机号验证码登录" })

                const phoneNumber = `${context.body?.phoneNumber ?? ""}`.trim()
                if (!phoneNumber) return
                const user = await prisma.user.findUnique({ where: { phoneNumber: phoneNumber } })
                if (!user && !config.allowRegister) throw new APIError("FORBIDDEN", { message: "未开放注册" })
            }
        }),
    },
})
