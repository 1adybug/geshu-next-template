import type { NextApiRequest, NextApiResponse } from "next"

import { prisma } from "@/prisma"

import { loginParser } from "@/schemas/login"

import { getUserFromAccount } from "@/server/getUserFromAccount"

import { getOidcProvider } from "@/server/oidc/provider"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end()

    const uid = req.query.uid
    if (typeof uid !== "string" || !uid.trim()) return res.status(400).json({ message: "Invalid uid" })

    try {
        const wantsJson = req.headers.accept?.includes("application/json") || req.headers["content-type"]?.includes("application/json")

        let params: unknown = req.body

        if (typeof params === "string") {
            try {
                params = JSON.parse(params)
            } catch {
                return res.status(400).json({ message: "Invalid request body" })
            }
        }

        const { account, captcha } = loginParser(params)

        const user = await getUserFromAccount(account)
        if (!user) return res.status(404).json({ message: "用户不存在" })

        const captchaStore = await prisma.captcha.findUnique({ where: { userId: user.id } })
        if (!captchaStore || captchaStore.expiredAt < new Date()) return res.status(400).json({ message: "验证码不存在或已过期" })
        if (captchaStore.code !== captcha) return res.status(400).json({ message: "验证码错误" })

        await prisma.captcha.delete({ where: { userId: user.id } })

        const provider = getOidcProvider()

        const details = await provider.interactionDetails(req, res)
        if (details.uid !== uid) return res.status(400).json({ message: "Interaction mismatch" })
        if (details.prompt?.name !== "login") return res.status(400).json({ message: "Unexpected prompt" })

        const result = {
            login: {
                accountId: user.id,
            },
        }

        if (wantsJson) {
            const returnTo = await provider.interactionResult(req, res, result, { mergeWithLastSubmission: false })
            res.status(200).json({ returnTo })
            return
        }

        provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false })
        return
    } catch (e) {
        const message = (e as { error_description?: string; message?: string } | undefined)?.error_description || (e as Error)?.message || "登录失败"
        return res.status(400).json({ message })
    }
}
