"use client"

import { type FC, type ReactNode, useEffect, useState } from "react"

import { Button, Form, Input } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { schemaToRule } from "soda-antd"

import { useLogin } from "@/hooks/useLogin"
import { useSendPhoneNumberOtp } from "@/hooks/useSendPhoneNumberOtp"

import { accountSchema } from "@/schemas/account"
import type { LoginParams } from "@/schemas/login"
import { otpSchema } from "@/schemas/otp"

export interface PhoneLoginFormProps {
    children?: ReactNode
    disabled?: boolean
    pending?: boolean
    submitLabel?: string
    onLoginSuccess?: () => Promise<void> | void
}

export const PhoneLoginForm: FC<PhoneLoginFormProps> = ({ children, disabled = false, onLoginSuccess, pending = false, submitLabel = "登录" }) => {
    const [form] = useForm<LoginParams>()
    const [left, setLeft] = useState(0)

    const { mutateAsync: sendPhoneNumberOtp, isPending: isSendPhoneNumberOtpPending } = useSendPhoneNumberOtp({
        onSuccess() {
            setLeft(60)
        },
    })

    const { mutateAsync: login, isPending: isLoginPending } = useLogin({
        async onSuccess() {
            if (onLoginSuccess) await onLoginSuccess()
        },
    })

    useEffect(() => {
        if (left === 0) return
        const timeout = setTimeout(() => setLeft(Math.max(0, left - 1)), 1000)
        return () => clearTimeout(timeout)
    }, [left])

    function sendOtp() {
        void sendPhoneNumberOtp(form.getFieldValue("account"))
    }

    const isPending = pending || isLoginPending
    const isDisabled = disabled || isPending

    return (
        <Form<LoginParams>
            name="phone-login-form"
            form={form}
            className="!mx-auto flex w-64 flex-col"
            disabled={isDisabled}
            onFinish={values => void login(values)}
        >
            <FormItem<LoginParams> name="account" rules={[schemaToRule(accountSchema)]}>
                <Input placeholder="用户名或手机号" autoComplete="username" />
            </FormItem>
            <div className="flex gap-2">
                <FormItem<LoginParams> name="otp" rules={[schemaToRule(otpSchema)]}>
                    <Input placeholder="验证码" autoComplete="one-time-code" inputMode="numeric" />
                </FormItem>
                <Button className="w-[112px] flex-none" onClick={sendOtp} loading={isSendPhoneNumberOtpPending} disabled={isDisabled || left > 0}>
                    {left > 0 ? `${left} 秒后重试` : "发送验证码"}
                </Button>
            </div>
            <Button className="mt-4" type="primary" block loading={isPending} disabled={isDisabled} htmlType="submit">
                {pending ? "正在绑定..." : submitLabel}
            </Button>
            {children}
        </Form>
    )
}
