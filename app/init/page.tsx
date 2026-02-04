"use client"

import { FC } from "react"

import { Button, Form, Input } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { useRouter } from "next/navigation"
import { schemaToRule } from "soda-antd"

import Brand from "@/components/Brand"

import { useCreateFirstUser } from "@/hooks/useCreateFirstUser"

import { CreateFirstUserParams } from "@/schemas/createFirstUser"
import { phoneNumberSchema } from "@/schemas/phoneNumber"
import { userEmailSchema } from "@/schemas/userEmail"
import { usernameSchema } from "@/schemas/username"
import { userPasswordSchema } from "@/schemas/userPassword"

const Page: FC = () => {
    const router = useRouter()
    const [form] = useForm<CreateFirstUserParams>()

    const { mutateAsync, isPending } = useCreateFirstUser({
        onSuccess() {
            router.replace("/login")
        },
    })

    return (
        <main className="grid h-full grid-cols-1 sm:grid-cols-2">
            <div className="relative p-8">
                <Brand />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Form<CreateFirstUserParams> form={form} className="flex w-64 flex-col" onFinish={mutateAsync}>
                        <FormItem<CreateFirstUserParams> name="name" rules={[schemaToRule(usernameSchema)]}>
                            <Input placeholder="用户名" autoComplete="off" />
                        </FormItem>
                        <FormItem<CreateFirstUserParams> name="email" rules={[schemaToRule(userEmailSchema)]}>
                            <Input placeholder="邮箱" autoComplete="off" />
                        </FormItem>
                        <FormItem<CreateFirstUserParams> name="phoneNumber" rules={[schemaToRule(phoneNumberSchema)]}>
                            <Input placeholder="手机号" autoComplete="off" />
                        </FormItem>
                        <FormItem<CreateFirstUserParams> name="password" rules={[schemaToRule(userPasswordSchema)]}>
                            <Input placeholder="密码" autoComplete="off" />
                        </FormItem>
                        <Button className="mt-4" type="primary" block disabled={isPending} htmlType="submit">
                            初始化
                        </Button>
                    </Form>
                </div>
            </div>
            <div className="hidden bg-[url('/login.webp')] bg-cover bg-bottom sm:block" />
        </main>
    )
}

export default Page
