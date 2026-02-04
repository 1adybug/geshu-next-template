"use client"

import { FC, useEffect } from "react"

import { Button, Form, Input, Switch } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"

import { useGetSystemConfig } from "@/hooks/useGetSystemConfig"
import { useUpdateSystemConfig } from "@/hooks/useUpdateSystemConfig"

import { SystemConfigParams } from "@/schemas/systemConfig"

const Page: FC = () => {
    const [form] = useForm<SystemConfigParams>()
    const { data, isLoading } = useGetSystemConfig()

    const { mutateAsync, isPending } = useUpdateSystemConfig({
        onSuccess() {
            form.resetFields()
        },
    })

    useEffect(() => {
        if (!data) return
        form.setFieldsValue(data)
    }, [data, form])

    function onFinish(values: SystemConfigParams) {
        return mutateAsync(values)
    }

    const isRequesting = isLoading || isPending

    return (
        <div className="flex h-full flex-col gap-4 pt-4">
            <title>系统设置</title>
            <div className="flex-none px-4">
                <Form<SystemConfigParams>
                    form={form}
                    className="grid max-w-3xl grid-cols-1 gap-4"
                    layout="vertical"
                    disabled={isRequesting}
                    onFinish={onFinish}
                >
                    <FormItem<SystemConfigParams> name="allowRegister" label="开放注册" valuePropName="checked">
                        <Switch />
                    </FormItem>
                    <FormItem<SystemConfigParams> name="enableEmailPassword" label="邮箱 + 密码" valuePropName="checked">
                        <Switch />
                    </FormItem>
                    <FormItem<SystemConfigParams> name="enableEmailOtp" label="邮箱 + 验证码" valuePropName="checked">
                        <Switch />
                    </FormItem>
                    <FormItem<SystemConfigParams> name="enablePhonePassword" label="手机号 + 密码" valuePropName="checked">
                        <Switch />
                    </FormItem>
                    <FormItem<SystemConfigParams> name="enablePhoneOtp" label="手机号 + 验证码" valuePropName="checked">
                        <Switch />
                    </FormItem>
                    <FormItem<SystemConfigParams> name="defaultEmailDomain" label="默认邮箱域名">
                        <Input placeholder="geshu.ai" autoComplete="off" />
                    </FormItem>
                    <FormItem<SystemConfigParams>>
                        <Button type="primary" htmlType="submit" disabled={isRequesting}>
                            保存
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    )
}

export default Page
