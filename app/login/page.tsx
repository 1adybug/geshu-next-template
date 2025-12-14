"use client"

import { FC, useEffect, useState } from "react"

import { Button, Form, Input } from "antd"
import { useForm, useWatch } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { useRouter, useSearchParams } from "next/navigation"

import Brand from "@/components/Brand"

import { useSendCaptcha } from "@/hooks/useSendCaptcha"

import { LoginParams } from "@/schemas/login"

const Page: FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const uid = searchParams?.get("uid")?.trim()
    const from = searchParams?.get("from")?.trim()

    const [form] = useForm<LoginParams>()
    const [left, setleft] = useState(0)
    const [isLoginPending, setIsLoginPending] = useState(false)
    const account = useWatch("account", form)
    const captcha = useWatch("captcha", form)

    const { mutateAsync: sendCaptcha, isPending: isSendCaptchaPending } = useSendCaptcha({
        onSuccess(data) {
            message.success(`验证码已发送至 ${data}`)
            setleft(60)
        },
        onError(error) {
            message.error(error.message || "发送验证码失败")
        },
    })

    useEffect(() => {
        if (left <= 0) return
        const timeout = setTimeout(() => setleft(l => l - 1), 1000)
        return () => clearTimeout(timeout)
    }, [left])

    const isRequesting = isLoginPending || isSendCaptchaPending

    return (
        <main className="grid h-full grid-cols-1 sm:grid-cols-2">
            <div className="relative p-8">
                <Brand />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {uid ? (
                        <Form<LoginParams>
                            form={form}
                            className="flex w-64 flex-col gap-4"
                            onFinish={async values => {
                                try {
                                    setIsLoginPending(true)
                                    const res = await fetch(`/api/oidc/interaction/${encodeURIComponent(uid)}/login`, {
                                        method: "POST",
                                        headers: { "content-type": "application/json", accept: "application/json" },
                                        body: JSON.stringify(values),
                                        credentials: "include",
                                    })

                                    if (!res.ok) {
                                        const isJson = res.headers.get("content-type")?.includes("application/json")
                                        const data = isJson ? ((await res.json().catch(() => undefined)) as { message?: string } | undefined) : undefined
                                        const text = !isJson ? await res.text().catch(() => "") : ""
                                        message.error(data?.message || text || "登录失败")
                                        return
                                    }

                                    const data = (await res.json().catch(() => undefined)) as { returnTo?: string; message?: string } | undefined

                                    if (!data?.returnTo) {
                                        message.error(data?.message || "登录失败")
                                        return
                                    }

                                    window.location.href = data.returnTo
                                } catch (e) {
                                    message.error((e as Error)?.message || "登录失败")
                                } finally {
                                    setIsLoginPending(false)
                                }
                            }}
                        >
                            <FormItem<LoginParams> name="account" noStyle>
                                <Input placeholder="用户名或手机号" autoComplete="off" />
                            </FormItem>
                            <div className="flex items-center gap-2">
                                <FormItem<LoginParams> name="captcha" noStyle>
                                    <Input placeholder="验证码" autoComplete="off" />
                                </FormItem>
                                <Button
                                    className="min-w-24"
                                    color="purple"
                                    variant="solid"
                                    disabled={isRequesting || left > 0 || !account}
                                    onClick={() => sendCaptcha(account)}
                                >
                                    {left > 0 ? `${left} 秒后重试` : "发送验证码"}
                                </Button>
                            </div>
                            <Button className="mt-4" type="primary" block disabled={isRequesting || !account || !captcha} htmlType="submit">
                                登录
                            </Button>
                        </Form>
                    ) : (
                        <div className="flex w-64 flex-col gap-4">
                            <Button
                                type="primary"
                                block
                                onClick={() => {
                                    const callbackUrl = from ? `?callbackUrl=${encodeURIComponent(from)}` : ""
                                    router.push(`/api/auth/signin${callbackUrl}`)
                                }}
                            >
                                登录
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="hidden bg-[url('/login.webp')] bg-cover bg-bottom sm:block" />
        </main>
    )
}

export default Page
