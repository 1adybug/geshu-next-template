import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"
import { phoneNumber } from "better-auth/plugins/phone-number"

import { CookiePrefix, IsDevelopment } from "@/constants"

import { prisma } from "@/prisma"

import { phoneNumberRegex } from "@/schemas/phoneNumber"

import { setDevOtp } from "@/server/devOtpStore"
import { getTempEmail } from "@/server/getTempEmail"

import { sendOtp } from "./sendOtp"

export const auth = betterAuth({
    baseURL: "http://localhost:3000",
    database: prismaAdapter(prisma, { provider: "sqlite" }),
    advanced: {
        cookiePrefix: CookiePrefix,
    },
    emailAndPassword: {
        enabled: false,
    },
    plugins: [
        admin(),
        phoneNumber({
            otpLength: 4,
            phoneNumberValidator(phoneNumber) {
                return phoneNumberRegex.test(phoneNumber)
            },
            sendOTP({ phoneNumber, code }) {
                if (IsDevelopment) {
                    console.log(`手机号验证码: ${phoneNumber} -> ${code}`)
                    setDevOtp({ phoneNumber }, code)
                    return
                }

                sendOtp({ phoneNumber, code })
            },
            signUpOnVerification: {
                getTempEmail,
                getTempName(phoneNumber) {
                    return phoneNumber
                },
            },
        }),
        nextCookies(),
    ],
})
