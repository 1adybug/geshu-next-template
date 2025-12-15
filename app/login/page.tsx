"use client"

import { FC, useEffect, useState } from "react"

import { Button, Form, Input } from "antd"
import { useForm, useWatch } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

import Brand from "@/components/Brand"

import { useLoginOidcInteraction } from "@/hooks/useLoginOidcInteraction"
import { useSendCaptcha } from "@/hooks/useSendCaptcha"

import { LoginParams } from "@/schemas/login"

const Page: FC = () => {
    const searchParams = useSearchParams()
    const uid = searchParams?.get("uid")?.trim()
    const from = searchParams?.get("from")?.trim()

    const [form] = useForm<LoginParams>()
    const [left, setleft] = useState(0)
    const [isLoginPending, setIsLoginPending] = useState(false)
    const account = useWatch("account", form)
    const captcha = useWatch("captcha", form)

    const { mutateAsync: loginOidcInteraction, isPending: isLoginOidcInteractionPending } = useLoginOidcInteraction()

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

    const isRequesting = isLoginPending || isLoginOidcInteractionPending || isSendCaptchaPending

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
                                    if (!uid) throw new Error("缺少 uid")
                                    const data = await loginOidcInteraction({ uid, ...values })
                                    window.location.href = data.returnTo
                                } catch (e) {
                                    message.error((e as Error)?.message || "登录失败")
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
                        <Form<LoginParams>
                            form={form}
                            className="flex w-64 flex-col gap-4"
                            onFinish={async values => {
                                try {
                                    setIsLoginPending(true)
                                    const result = await signIn("captcha", {
                                        redirect: false,
                                        account: values.account,
                                        captcha: values.captcha,
                                        callbackUrl: from || "/",
                                    })

                                    if (!result?.ok) {
                                        message.error(result?.error || "登录失败")
                                        return
                                    }

                                    window.location.href = result.url || from || "/"
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
                    )}
                </div>
            </div>
            <div className="hidden bg-[url('/login.webp')] bg-cover bg-bottom sm:block" />
        </main>
    )
}

export default Page
