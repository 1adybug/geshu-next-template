"use client"

import { FC, useEffect, useState } from "react"

import { Button, Card, Form, Input, Table } from "antd"
import FormItem from "antd/es/form/FormItem"

import { createLocalUser, getLocalUsers, loginAsLocalUser, logoutLocalUser } from "@/utils/localUsersApi"

export interface LocalUserRow {
    id: string
    username: string
    createdAt: string
}

const Page: FC = () => {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<LocalUserRow[]>([])
    const [form] = Form.useForm<{ username: string }>()

    async function reload() {
        setLoading(true)

        try {
            const data = await getLocalUsers()
            setUsers(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        reload()
    }, [])

    return (
        <main style={{ padding: 24 }}>
            <Card title="本地用户管理（示例）" style={{ maxWidth: 920, margin: "0 auto" }}>
                <Form
                    form={form}
                    layout="inline"
                    onFinish={async values => {
                        await createLocalUser({ username: values.username })
                        form.resetFields()
                        await reload()
                    }}
                >
                    <FormItem name="username" rules={[{ required: true, message: "请输入用户名" }]}>
                        <Input placeholder="用户名" />
                    </FormItem>
                    <Button type="primary" htmlType="submit">
                        新增用户
                    </Button>
                    <Button onClick={logoutLocalUser}>退出本站</Button>
                    <Button href="/">返回首页</Button>
                </Form>

                <div style={{ marginTop: 16 }}>
                    <Table<LocalUserRow>
                        rowKey="id"
                        loading={loading}
                        dataSource={users}
                        pagination={false}
                        columns={[
                            { title: "ID", dataIndex: "id" },
                            { title: "用户名", dataIndex: "username" },
                            { title: "创建时间", dataIndex: "createdAt" },
                            {
                                title: "操作",
                                dataIndex: "id",
                                render(value: string) {
                                    return (
                                        <Button
                                            type="link"
                                            onClick={async () => {
                                                await loginAsLocalUser({ id: value })
                                                await reload()
                                            }}
                                        >
                                            以此用户登录
                                        </Button>
                                    )
                                },
                            },
                        ]}
                    />
                </div>
            </Card>
        </main>
    )
}

export default Page
