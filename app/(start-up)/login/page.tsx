"use client"

import { FC, useEffect, useState } from "react"

import { Button, Form, Input, Tabs, TabsProps } from "antd"
import { useForm, useWatch } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { schemaToRule } from "soda-antd"

import { useGetSystemConfig } from "@/hooks/useGetSystemConfig"
import { useLoginEmailOtp } from "@/hooks/useLoginEmailOtp"
import { useLoginEmailPassword } from "@/hooks/useLoginEmailPassword"
import { useLoginPhoneOtp } from "@/hooks/useLoginPhoneOtp"
import { useLoginPhonePassword } from "@/hooks/useLoginPhonePassword"
import { useRegisterEmailOtp } from "@/hooks/useRegisterEmailOtp"
import { useRegisterEmailPassword } from "@/hooks/useRegisterEmailPassword"
import { useRegisterPhoneOtp } from "@/hooks/useRegisterPhoneOtp"
import { useRegisterPhonePassword } from "@/hooks/useRegisterPhonePassword"
import { useSendEmailOtp } from "@/hooks/useSendEmailOtp"
import { useSendPhoneOtp } from "@/hooks/useSendPhoneOtp"

import { emailSchema } from "@/schemas/email"
import { LoginEmailOtpParams } from "@/schemas/loginEmailOtp"
import { LoginEmailPasswordParams } from "@/schemas/loginEmailPassword"
import { LoginPhoneOtpParams } from "@/schemas/loginPhoneOtp"
import { LoginPhonePasswordParams } from "@/schemas/loginPhonePassword"
import { otpSchema } from "@/schemas/otp"
import { passwordSchema } from "@/schemas/password"
import { phoneNumberSchema } from "@/schemas/phoneNumber"
import { RegisterEmailOtpParams } from "@/schemas/registerEmailOtp"
import { RegisterEmailPasswordParams } from "@/schemas/registerEmailPassword"
import { RegisterPhoneOtpParams } from "@/schemas/registerPhoneOtp"
import { RegisterPhonePasswordParams } from "@/schemas/registerPhonePassword"
import { defaultSystemConfig } from "@/schemas/systemConfig"

const AuthMode = {
    登录: "login",
    注册: "register",
} as const

type AuthMode = (typeof AuthMode)[keyof typeof AuthMode]

function useOtpCountdown() {
    const [left, setLeft] = useState(0)

    useEffect(() => {
        if (left <= 0) return
        const timeout = setTimeout(() => setLeft(prev => prev - 1), 1000)
        return () => clearTimeout(timeout)
    }, [left])

    function start() {
        setLeft(60)
    }

    return {
        left,
        start,
    }
}

function normalizeValue(value?: string) {
    if (typeof value !== "string") return value
    const nextValue = value.trim()
    return nextValue ? nextValue : undefined
}

const Page: FC = () => {
    const { data: systemConfig = defaultSystemConfig } = useGetSystemConfig()
    const allowRegister = systemConfig.allowRegister

    const [mode, setMode] = useState<AuthMode>(AuthMode.登录)

    const [loginEmailPasswordForm] = useForm<LoginEmailPasswordParams>()
    const [loginEmailOtpForm] = useForm<LoginEmailOtpParams>()
    const [loginPhonePasswordForm] = useForm<LoginPhonePasswordParams>()
    const [loginPhoneOtpForm] = useForm<LoginPhoneOtpParams>()

    const [registerEmailPasswordForm] = useForm<RegisterEmailPasswordParams>()
    const [registerEmailOtpForm] = useForm<RegisterEmailOtpParams>()
    const [registerPhonePasswordForm] = useForm<RegisterPhonePasswordParams>()
    const [registerPhoneOtpForm] = useForm<RegisterPhoneOtpParams>()

    const loginEmailPasswordEmail = useWatch("email", loginEmailPasswordForm)
    const loginEmailPasswordPassword = useWatch("password", loginEmailPasswordForm)
    const loginEmailOtpEmail = useWatch("email", loginEmailOtpForm)
    const loginEmailOtpCode = useWatch("otp", loginEmailOtpForm)
    const loginPhonePasswordPhone = useWatch("phone", loginPhonePasswordForm)
    const loginPhonePasswordPassword = useWatch("password", loginPhonePasswordForm)
    const loginPhoneOtpPhone = useWatch("phone", loginPhoneOtpForm)
    const loginPhoneOtpCode = useWatch("otp", loginPhoneOtpForm)

    const registerEmailPasswordEmail = useWatch("email", registerEmailPasswordForm)
    const registerEmailPasswordPassword = useWatch("password", registerEmailPasswordForm)
    const registerEmailOtpEmail = useWatch("email", registerEmailOtpForm)
    const registerEmailOtpCode = useWatch("otp", registerEmailOtpForm)
    const registerPhonePasswordPhone = useWatch("phone", registerPhonePasswordForm)
    const registerPhonePasswordPassword = useWatch("password", registerPhonePasswordForm)
    const registerPhoneOtpPhone = useWatch("phone", registerPhoneOtpForm)
    const registerPhoneOtpCode = useWatch("otp", registerPhoneOtpForm)

    const loginEmailOtpCountdown = useOtpCountdown()
    const loginPhoneOtpCountdown = useOtpCountdown()
    const registerEmailOtpCountdown = useOtpCountdown()
    const registerPhoneOtpCountdown = useOtpCountdown()

    const { mutateAsync: loginEmailPassword, isPending: isLoginEmailPasswordPending } = useLoginEmailPassword()
    const { mutateAsync: loginEmailOtp, isPending: isLoginEmailOtpPending } = useLoginEmailOtp()
    const { mutateAsync: loginPhonePassword, isPending: isLoginPhonePasswordPending } = useLoginPhonePassword()
    const { mutateAsync: loginPhoneOtp, isPending: isLoginPhoneOtpPending } = useLoginPhoneOtp()

    const { mutateAsync: registerEmailPassword, isPending: isRegisterEmailPasswordPending } = useRegisterEmailPassword()
    const { mutateAsync: registerEmailOtp, isPending: isRegisterEmailOtpPending } = useRegisterEmailOtp()
    const { mutateAsync: registerPhonePassword, isPending: isRegisterPhonePasswordPending } = useRegisterPhonePassword()
    const { mutateAsync: registerPhoneOtp, isPending: isRegisterPhoneOtpPending } = useRegisterPhoneOtp()

    const { mutateAsync: sendLoginEmailOtp, isPending: isSendLoginEmailOtpPending } = useSendEmailOtp({
        onSuccess() {
            loginEmailOtpCountdown.start()
        },
    })

    const { mutateAsync: sendLoginPhoneOtp, isPending: isSendLoginPhoneOtpPending } = useSendPhoneOtp({
        onSuccess() {
            loginPhoneOtpCountdown.start()
        },
    })

    const { mutateAsync: sendRegisterEmailOtp, isPending: isSendRegisterEmailOtpPending } = useSendEmailOtp({
        onSuccess() {
            registerEmailOtpCountdown.start()
        },
    })

    const { mutateAsync: sendRegisterPhoneOtp, isPending: isSendRegisterPhoneOtpPending } = useSendPhoneOtp({
        onSuccess() {
            registerPhoneOtpCountdown.start()
        },
    })

    function onModeChange(nextMode: string | number) {
        if (nextMode === AuthMode.登录 || nextMode === AuthMode.注册) setMode(nextMode)
    }

    function onSendLoginEmailOtp() {
        if (!loginEmailOtpEmail) return
        return sendLoginEmailOtp({ email: loginEmailOtpEmail })
    }

    function onSendLoginPhoneOtp() {
        if (!loginPhoneOtpPhone) return
        return sendLoginPhoneOtp({ phoneNumber: loginPhoneOtpPhone })
    }

    function onSendRegisterEmailOtp() {
        if (!registerEmailOtpEmail) return
        return sendRegisterEmailOtp({ email: registerEmailOtpEmail })
    }

    function onSendRegisterPhoneOtp() {
        if (!registerPhoneOtpPhone) return
        return sendRegisterPhoneOtp({ phoneNumber: registerPhoneOtpPhone })
    }

    const loginTabs: NonNullable<TabsProps["items"]> = []

    if (systemConfig.enableEmailPassword) {
        loginTabs.push({
            key: "email-password",
            label: "邮箱密码",
            children: (
                <Form<LoginEmailPasswordParams> form={loginEmailPasswordForm} className="flex w-64 flex-col" onFinish={loginEmailPassword}>
                    <FormItem<LoginEmailPasswordParams> name="email" rules={[schemaToRule(emailSchema)]} normalize={normalizeValue}>
                        <Input placeholder="邮箱" autoComplete="off" />
                    </FormItem>
                    <FormItem<LoginEmailPasswordParams> name="password" rules={[schemaToRule(passwordSchema)]}>
                        <Input.Password placeholder="密码" autoComplete="off" />
                    </FormItem>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isLoginEmailPasswordPending || !loginEmailPasswordEmail || !loginEmailPasswordPassword}
                        htmlType="submit"
                    >
                        登录
                    </Button>
                </Form>
            ),
        })
    }

    if (systemConfig.enableEmailOtp) {
        loginTabs.push({
            key: "email-otp",
            label: "邮箱验证码",
            children: (
                <Form<LoginEmailOtpParams> form={loginEmailOtpForm} className="flex w-64 flex-col" onFinish={loginEmailOtp}>
                    <FormItem<LoginEmailOtpParams> name="email" rules={[schemaToRule(emailSchema)]} normalize={normalizeValue}>
                        <Input placeholder="邮箱" autoComplete="off" />
                    </FormItem>
                    <div className="flex gap-2">
                        <FormItem<LoginEmailOtpParams> name="otp" rules={[schemaToRule(otpSchema)]}>
                            <Input placeholder="验证码" autoComplete="off" />
                        </FormItem>
                        <Button
                            className="min-w-24"
                            color="purple"
                            variant="solid"
                            disabled={isSendLoginEmailOtpPending || loginEmailOtpCountdown.left > 0 || !loginEmailOtpEmail}
                            onClick={onSendLoginEmailOtp}
                        >
                            {loginEmailOtpCountdown.left > 0 ? `${loginEmailOtpCountdown.left} 秒后重试` : "发送验证码"}
                        </Button>
                    </div>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isLoginEmailOtpPending || !loginEmailOtpEmail || !loginEmailOtpCode}
                        htmlType="submit"
                    >
                        登录
                    </Button>
                </Form>
            ),
        })
    }

    if (systemConfig.enablePhonePassword) {
        loginTabs.push({
            key: "phone-password",
            label: "手机号密码",
            children: (
                <Form<LoginPhonePasswordParams> form={loginPhonePasswordForm} className="flex w-64 flex-col" onFinish={loginPhonePassword}>
                    <FormItem<LoginPhonePasswordParams> name="phoneNumber" rules={[schemaToRule(phoneNumberSchema)]} normalize={normalizeValue}>
                        <Input placeholder="手机号" autoComplete="off" />
                    </FormItem>
                    <FormItem<LoginPhonePasswordParams> name="password" rules={[schemaToRule(passwordSchema)]}>
                        <Input.Password placeholder="密码" autoComplete="off" />
                    </FormItem>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isLoginPhonePasswordPending || !loginPhonePasswordPhone || !loginPhonePasswordPassword}
                        htmlType="submit"
                    >
                        登录
                    </Button>
                </Form>
            ),
        })
    }

    if (systemConfig.enablePhoneOtp) {
        loginTabs.push({
            key: "phone-otp",
            label: "手机号验证码",
            children: (
                <Form<LoginPhoneOtpParams> form={loginPhoneOtpForm} className="flex w-64 flex-col" onFinish={loginPhoneOtp}>
                    <FormItem<LoginPhoneOtpParams> name="phoneNumber" rules={[schemaToRule(phoneNumberSchema)]} normalize={normalizeValue}>
                        <Input placeholder="手机号" autoComplete="off" />
                    </FormItem>
                    <div className="flex gap-2">
                        <FormItem<LoginPhoneOtpParams> name="code" rules={[schemaToRule(otpSchema)]}>
                            <Input placeholder="验证码" autoComplete="off" />
                        </FormItem>
                        <Button
                            className="min-w-24"
                            color="purple"
                            variant="solid"
                            disabled={isSendLoginPhoneOtpPending || loginPhoneOtpCountdown.left > 0 || !loginPhoneOtpPhone}
                            onClick={onSendLoginPhoneOtp}
                        >
                            {loginPhoneOtpCountdown.left > 0 ? `${loginPhoneOtpCountdown.left} 秒后重试` : "发送验证码"}
                        </Button>
                    </div>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isLoginPhoneOtpPending || !loginPhoneOtpPhone || !loginPhoneOtpCode}
                        htmlType="submit"
                    >
                        登录
                    </Button>
                </Form>
            ),
        })
    }

    const registerTabs: NonNullable<TabsProps["items"]> = []

    if (systemConfig.enableEmailPassword) {
        registerTabs.push({
            key: "register-email-password",
            label: "邮箱密码",
            children: (
                <Form<RegisterEmailPasswordParams> form={registerEmailPasswordForm} className="flex w-64 flex-col" onFinish={registerEmailPassword}>
                    <FormItem<RegisterEmailPasswordParams> name="email" rules={[schemaToRule(emailSchema)]} normalize={normalizeValue}>
                        <Input placeholder="邮箱" autoComplete="off" />
                    </FormItem>
                    <FormItem<RegisterEmailPasswordParams> name="password" rules={[schemaToRule(passwordSchema)]}>
                        <Input.Password placeholder="密码" autoComplete="off" />
                    </FormItem>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isRegisterEmailPasswordPending || !registerEmailPasswordEmail || !registerEmailPasswordPassword}
                        htmlType="submit"
                    >
                        注册
                    </Button>
                </Form>
            ),
        })
    }

    if (systemConfig.enableEmailOtp) {
        registerTabs.push({
            key: "register-email-otp",
            label: "邮箱验证码",
            children: (
                <Form<RegisterEmailOtpParams> form={registerEmailOtpForm} className="flex w-64 flex-col" onFinish={registerEmailOtp}>
                    <FormItem<RegisterEmailOtpParams> name="email" rules={[schemaToRule(emailSchema)]} normalize={normalizeValue}>
                        <Input placeholder="邮箱" autoComplete="off" />
                    </FormItem>
                    <div className="flex gap-2">
                        <FormItem<RegisterEmailOtpParams> name="otp" rules={[schemaToRule(otpSchema)]}>
                            <Input placeholder="验证码" autoComplete="off" />
                        </FormItem>
                        <Button
                            className="min-w-24"
                            color="purple"
                            variant="solid"
                            disabled={isSendRegisterEmailOtpPending || registerEmailOtpCountdown.left > 0 || !registerEmailOtpEmail}
                            onClick={onSendRegisterEmailOtp}
                        >
                            {registerEmailOtpCountdown.left > 0 ? `${registerEmailOtpCountdown.left} 秒后重试` : "发送验证码"}
                        </Button>
                    </div>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isRegisterEmailOtpPending || !registerEmailOtpEmail || !registerEmailOtpCode}
                        htmlType="submit"
                    >
                        注册
                    </Button>
                </Form>
            ),
        })
    }

    if (systemConfig.enablePhonePassword) {
        registerTabs.push({
            key: "register-phone-password",
            label: "手机号密码",
            children: (
                <Form<RegisterPhonePasswordParams> form={registerPhonePasswordForm} className="flex w-64 flex-col" onFinish={registerPhonePassword}>
                    <FormItem<RegisterPhonePasswordParams> name="phoneNumber" rules={[schemaToRule(phoneNumberSchema)]} normalize={normalizeValue}>
                        <Input placeholder="手机号" autoComplete="off" />
                    </FormItem>
                    <FormItem<RegisterPhonePasswordParams> name="password" rules={[schemaToRule(passwordSchema)]}>
                        <Input.Password placeholder="密码" autoComplete="off" />
                    </FormItem>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isRegisterPhonePasswordPending || !registerPhonePasswordPhone || !registerPhonePasswordPassword}
                        htmlType="submit"
                    >
                        注册
                    </Button>
                </Form>
            ),
        })
    }

    if (systemConfig.enablePhoneOtp) {
        registerTabs.push({
            key: "register-phone-otp",
            label: "手机号验证码",
            children: (
                <Form<RegisterPhoneOtpParams> form={registerPhoneOtpForm} className="flex w-64 flex-col" onFinish={registerPhoneOtp}>
                    <FormItem<RegisterPhoneOtpParams> name="phoneNumber" rules={[schemaToRule(phoneNumberSchema)]} normalize={normalizeValue}>
                        <Input placeholder="手机号" autoComplete="off" />
                    </FormItem>
                    <div className="flex gap-2">
                        <FormItem<RegisterPhoneOtpParams> name="otp" rules={[schemaToRule(otpSchema)]}>
                            <Input placeholder="验证码" autoComplete="off" />
                        </FormItem>
                        <Button
                            className="min-w-24"
                            color="purple"
                            variant="solid"
                            disabled={isSendRegisterPhoneOtpPending || registerPhoneOtpCountdown.left > 0 || !registerPhoneOtpPhone}
                            onClick={onSendRegisterPhoneOtp}
                        >
                            {registerPhoneOtpCountdown.left > 0 ? `${registerPhoneOtpCountdown.left} 秒后重试` : "发送验证码"}
                        </Button>
                    </div>
                    <Button
                        className="mt-2"
                        type="primary"
                        block
                        disabled={isRegisterPhoneOtpPending || !registerPhoneOtpPhone || !registerPhoneOtpCode}
                        htmlType="submit"
                    >
                        注册
                    </Button>
                </Form>
            ),
        })
    }

    return (
        <div className="mx-auto w-64">
            {allowRegister ? (
                <Tabs
                    activeKey={mode}
                    centered
                    items={[
                        {
                            key: AuthMode.登录,
                            label: "登录",
                            children: <Tabs items={loginTabs} />,
                        },
                        {
                            key: AuthMode.注册,
                            label: "注册",
                            children: <Tabs items={registerTabs} />,
                        },
                    ]}
                    onChange={onModeChange}
                />
            ) : (
                <Tabs items={loginTabs} />
            )}
        </div>
    )
}

export default Page
