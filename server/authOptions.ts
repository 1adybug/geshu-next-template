import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"

import { prisma } from "@/prisma"

import { loginParser } from "@/schemas/login"

import { getUserFromAccount } from "@/server/getUserFromAccount"

export interface JwtToken {
    sub?: string
    username?: string
    phone?: string
    role?: string
}

let cached: NextAuthOptions | undefined

export function getAuthOptions(): NextAuthOptions {
    cached ??= {
        secret: process.env.NEXTAUTH_SECRET,
        session: { strategy: "jwt" },
        pages: { signIn: "/login" },
        providers: [
            CredentialsProvider({
                id: "captcha",
                name: "验证码登录",
                credentials: {
                    account: { label: "用户名或手机号", type: "text" },
                    captcha: { label: "验证码", type: "text" },
                },
                async authorize(credentials) {
                    const { account, captcha } = loginParser(credentials)
                    const user = await getUserFromAccount(account)
                    if (!user) throw new Error("用户不存在")

                    const captchaStore = await prisma.captcha.findUnique({ where: { userId: user.id } })
                    if (!captchaStore || captchaStore.expiredAt < new Date()) throw new Error("验证码不存在或已过期")
                    if (captchaStore.code !== captcha) throw new Error("验证码错误")

                    await prisma.captcha.delete({ where: { userId: user.id } })

                    return {
                        id: user.id,
                        name: user.username,
                    }
                },
            }),
        ],
        callbacks: {
            async jwt({ token, user }) {
                const typed = token as unknown as JwtToken

                if (user?.id) {
                    const id = String(user.id)
                    typed.sub = id
                    const dbUser = await prisma.user.findUnique({ where: { id } })

                    if (dbUser) {
                        typed.username = dbUser.username
                        typed.phone = dbUser.phone
                        typed.role = dbUser.role
                    }
                }

                return token as JWT
            },
            async session({ session, token }) {
                const typed = token as unknown as JwtToken
                ;(session.user as unknown as { id?: string }).id = typed.sub
                ;(session.user as unknown as { username?: string }).username = typed.username
                ;(session.user as unknown as { phone?: string }).phone = typed.phone
                ;(session.user as unknown as { role?: string }).role = typed.role
                return session
            },
        },
    }

    return cached!
}
