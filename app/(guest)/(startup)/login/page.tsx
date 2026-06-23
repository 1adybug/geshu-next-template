"use client"

import { type FC, useEffect, useId, useState } from "react"

import { Button, Form, Input } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { getErrorMessage } from "deepsea-tools"
import { useRouter } from "next/navigation"
import { schemaToRule } from "soda-antd"

import { GeshuOAuthProviderId } from "@/constants"

import { useLogin } from "@/hooks/useLogin"
import { useQueryGeshuOAuthLoginStatus } from "@/hooks/useQueryGeshuOAuthLoginStatus"
import { useSendPhoneNumberOtp } from "@/hooks/useSendPhoneNumberOtp"

import { accountSchema } from "@/schemas/account"
import type { LoginParams } from "@/schemas/login"
import { otpSchema } from "@/schemas/otp"

import { authClient } from "@/utils/authClient"

const Page: FC = () => {
    const key = useId()
    const router = useRouter()
    const [form] = useForm<LoginParams>()
    const [left, setLeft] = useState(0)
    const [isOAuthLoginPending, setIsOAuthLoginPending] = useState(false)

    const { data: geshuOAuthLoginStatus } = useQueryGeshuOAuthLoginStatus()

    const { mutateAsync: sendPhoneNumberOtp, isPending: isSendPhoneNumberOtpPending } = useSendPhoneNumberOtp({
        onSuccess() {
            setLeft(60)
        },
    })

    const { mutateAsync: login, isPending: isLoginPending } = useLogin({
        onSuccess() {
            router.refresh()
        },
    })

    useEffect(() => {
        if (left === 0) return
        const timeout = setTimeout(() => setLeft(Math.max(0, left - 1)), 1000)
        return () => clearTimeout(timeout)
    }, [left])

    function sendOtp() {
        sendPhoneNumberOtp(form.getFieldValue("account"))
    }

    async function onOAuthLogin() {
        if (isOAuthLoginPending) return

        if (!geshuOAuthLoginStatus?.ready) {
            message.open({
                key,
                type: "error",
                content: "账号平台登录未配置",
            })

            return
        }

        setIsOAuthLoginPending(true)

        message.open({
            key,
            type: "loading",
            content: "正在跳转账号平台...",
            duration: 0,
        })

        try {
            const response = await authClient.signIn.oauth2({
                providerId: GeshuOAuthProviderId,
                callbackURL: "/",
                errorCallbackURL: "/login",
            })

            if (response.error) throw new Error(response.error.message || "账号平台登录失败")

            message.destroy(key)
        } catch (error) {
            message.open({
                key,
                type: "error",
                content: getErrorMessage(error),
            })
        } finally {
            setIsOAuthLoginPending(false)
        }
    }

    const isOAuthLoginVisible = geshuOAuthLoginStatus?.enabled === true
    const isOAuthLoginReady = geshuOAuthLoginStatus?.ready === true

    return (
        <Form<LoginParams> name="login-form" form={form} className="!mx-auto flex w-64 flex-col" onFinish={login} disabled={isLoginPending}>
            <FormItem<LoginParams> name="account" rules={[schemaToRule(accountSchema)]}>
                <Input placeholder="用户名或手机号" autoComplete="off" />
            </FormItem>
            <div className="flex gap-2">
                <FormItem<LoginParams> name="otp" rules={[schemaToRule(otpSchema)]}>
                    <Input placeholder="验证码" autoComplete="off" />
                </FormItem>
                <Button className="w-[112px] flex-none" onClick={sendOtp} loading={isSendPhoneNumberOtpPending} disabled={left > 0}>
                    {left > 0 ? `${left} 秒后重试` : "发送验证码"}
                </Button>
            </div>
            <Button className="mt-4" type="primary" block disabled={isLoginPending} htmlType="submit">
                登录
            </Button>
            {isOAuthLoginVisible && (
                <Button
                    className="mt-4"
                    block
                    title={isOAuthLoginReady ? undefined : "账号平台登录未配置"}
                    loading={isOAuthLoginPending}
                    disabled={!isOAuthLoginReady}
                    onClick={onOAuthLogin}
                >
                    格数账号登录
                </Button>
            )}
        </Form>
    )
}

export default Page
