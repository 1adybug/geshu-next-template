"use client"

import { FC, useEffect, useState } from "react"

import { Button, Form } from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { FormInput } from "soda-heroui"

import Brand from "@/components/Brand"

import { useLogin } from "@/hooks/useLogin"
import { useSendCaptcha } from "@/hooks/useSendCaptcha"

import { LoginParams } from "@/schemas/login"

import { getOnSubmit } from "@/utils/getOnSubmit"

const Page: FC = () => {
    const [left, setleft] = useState(0)

    const { mutateAsync: login, isPending: isLoginPending } = useLogin()

    const { mutateAsync: sendCaptcha, isPending: isSendCaptchaPending } = useSendCaptcha({
        onSuccess(data) {
            message.success(`验证码已发送至 ${data}`)
            setleft(60)
        },
    })

    const form = useForm({
        defaultValues: {
            account: "",
            captcha: "",
        } as LoginParams,
        onSubmit({ value }) {
            login(value)
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
                    <Form className="w-64" onSubmit={getOnSubmit(form)}>
                        <form.Field name="account">{field => <FormInput field={field} placeholder="用户名或手机号" autoComplete="off" />}</form.Field>
                        <div className="flex items-center gap-2">
                            <form.Field name="captcha">{field => <FormInput field={field} placeholder="验证码" autoComplete="off" />}</form.Field>
                            <form.Subscribe selector={state => state.values.account.trim()}>
                                {account => (
                                    <Button
                                        role="button"
                                        className="min-w-24"
                                        color="secondary"
                                        variant="light"
                                        isDisabled={isRequesting || left > 0 || !account}
                                        onPress={() => sendCaptcha(account)}
                                    >
                                        {left > 0 ? `${left} 秒后重试` : "发送验证码"}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </div>
                        <form.Subscribe selector={state => state.values}>
                            {({ account, captcha }) => (
                                <Button className="mt-4" color="primary" fullWidth isDisabled={isRequesting || !account || !captcha} type="submit">
                                    登录
                                </Button>
                            )}
                        </form.Subscribe>
                    </Form>
                </div>
            </div>
            <div className="hidden bg-[url('/login.webp')] bg-cover bg-bottom sm:block" />
        </main>
    )
}

export default Page
