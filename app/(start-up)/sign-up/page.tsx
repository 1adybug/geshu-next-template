"use client"

import { Dispatch, FC, SetStateAction, useState } from "react"

import { Button, Form, Input, Tabs } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { getEnumEntries } from "deepsea-tools"

import { authClient } from "@/utils/authClient"

export const RegisterMethod = {
    邮箱注册: "email",
    手机号注册: "phone",
} as const

export type RegisterMethod = (typeof RegisterMethod)[keyof typeof RegisterMethod]

export interface RegisterParams {
    name: string
    password: string
    confirmPassword: string
    email: string
    phoneNumber: string
    otp: string
}

const Page: FC = () => {
    const [form] = useForm()
    const [method, setMethod] = useState<RegisterMethod>(RegisterMethod.邮箱注册)

    function onFinish({ phoneNumber, otp, email }: RegisterParams) {
        authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" })
        authClient.phoneNumber.sendOtp({ phoneNumber })
    }

    return (
        <div className="mx-auto w-80">
            <Tabs
                activeKey={method}
                onChange={setMethod as Dispatch<SetStateAction<string>>}
                centered
                items={getEnumEntries(RegisterMethod).map(([label, key]) => ({
                    label,
                    key,
                }))}
            />
            <Form<RegisterParams> form={form} labelCol={{ flex: "70px" }} onFinish={onFinish}>
                {method === RegisterMethod.邮箱注册 && (
                    <FormItem<RegisterParams> name="email" label="邮箱">
                        <Input type="email" />
                    </FormItem>
                )}
                {method === RegisterMethod.手机号注册 && (
                    <FormItem<RegisterParams> name="phoneNumber" label="手机号">
                        <Input />
                    </FormItem>
                )}
                <div className="flex gap-2">
                    <FormItem<RegisterParams> name="otp" label="验证码">
                        <Input autoComplete="off" />
                    </FormItem>
                    <Button>获取验证码</Button>
                </div>
                <Button className="mt-4" type="primary" block htmlType="submit">
                    注册
                </Button>
            </Form>
        </div>
    )
}

export default Page
