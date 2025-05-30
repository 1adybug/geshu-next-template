"use client"

import { FC, useState } from "react"
import { IconEye, IconEyeClosed } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Button, Form, Input } from "antd"
import FormItem from "antd/es/form/FormItem"
import { createRequestFn } from "deepsea-tools"

import { loginAction } from "@/actions/login"
import { LoginParams } from "@/schemas/login"

const mutationFn = createRequestFn(loginAction)

const Page: FC = () => {
    const { mutateAsync, isPending } = useMutation({ mutationFn })
    const [isShowPassword, setIsShowPassword] = useState(false)

    return (
        <main className="relative h-screen">
            <div className="absolute left-1/2 top-[45%] flex -translate-x-1/2 -translate-y-1/2 flex-col gap-8">
                <h1 className="flex items-end gap-2">
                    <div className="flex">
                        <img src="/geshu.svg" alt="" width={48} />
                    </div>
                    <div className="text-3xl font-bold">格数科技</div>
                </h1>
                <Form<LoginParams> onFinish={mutateAsync} disabled={isPending}>
                    <FormItem<LoginParams> name="username">
                        <Input classNames={{ input: "!font-[initial]" }} placeholder="请输入用户名" size="large" autoComplete="off" />
                    </FormItem>
                    <FormItem<LoginParams> name="password">
                        <Input
                            type={isShowPassword ? "text" : "password"}
                            classNames={{ input: "!font-[initial]" }}
                            placeholder="请输入密码"
                            size="large"
                            autoComplete="off"
                            suffix={
                                <button className="text-foreground-500" type="button" onClick={() => setIsShowPassword(prev => !prev)}>
                                    {isShowPassword ? <IconEye className="h-5 w-5" /> : <IconEyeClosed className="h-5 w-5" />}
                                </button>
                            }
                        />
                    </FormItem>
                    <FormItem<LoginParams>>
                        <Button block type="primary" htmlType="submit" size="large" loading={isPending}>
                            登录
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </main>
    )
}

export default Page
