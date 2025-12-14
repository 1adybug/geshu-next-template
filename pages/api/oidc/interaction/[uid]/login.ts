import type { NextApiRequest, NextApiResponse } from "next"

import { prisma } from "@/prisma"

import { loginParser } from "@/schemas/login"

import { getUserFromAccount } from "@/server/getUserFromAccount"

import { getOidcProvider } from "@/server/oidc/provider"

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method !== "POST") return response.status(405).end()

    const uid = request.query.uid
    if (typeof uid !== "string" || !uid.trim()) return response.status(400).json({ message: "Invalid uid" })

    try {
        const wantsJson = request.headers.accept?.includes("application/json") || request.headers["content-type"]?.includes("application/json")

        let params: unknown = request.body

        if (typeof params === "string") {
            try {
                params = JSON.parse(params)
            } catch {
                return response.status(400).json({ message: "Invalid request body" })
            }
        }

        const { account, captcha } = loginParser(params)

        const user = await getUserFromAccount(account)
        if (!user) return response.status(404).json({ message: "用户不存在" })

        const captchaStore = await prisma.captcha.findUnique({ where: { userId: user.id } })
        if (!captchaStore || captchaStore.expiredAt < new Date()) return response.status(400).json({ message: "验证码不存在或已过期" })
        if (captchaStore.code !== captcha) return response.status(400).json({ message: "验证码错误" })

        await prisma.captcha.delete({ where: { userId: user.id } })

        const provider = getOidcProvider()

        const details = await provider.interactionDetails(request, response)
        if (details.uid !== uid) return response.status(400).json({ message: "Interaction mismatch" })
        if (details.prompt?.name !== "login") return response.status(400).json({ message: "Unexpected prompt" })

        const result = {
            login: {
                accountId: user.id,
            },
        }

        if (wantsJson) {
            const returnTo = await provider.interactionResult(request, response, result, { mergeWithLastSubmission: false })
            response.status(200).json({ returnTo })
            return
        }

        provider.interactionFinished(request, response, result, { mergeWithLastSubmission: false })
        return
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "登录失败"
        return response.status(400).json({ message })
    }
}
