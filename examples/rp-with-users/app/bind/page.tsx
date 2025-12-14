"use client"

import { FC, useEffect, useState } from "react"

import { Button, Card, Form, Input, Table } from "antd"
import FormItem from "antd/es/form/FormItem"

import { bindPendingToLocalUser, createLocalUser, getLocalUsers, loginAsLocalUser } from "@/utils/localUsersApi"

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
            <Card title="绑定 MyApp 账号到本地用户" style={{ maxWidth: 920, margin: "0 auto" }}>
                <div style={{ marginBottom: 12, color: "#666" }}>
                    你已通过 MyApp 登录，但本站还没有找到对应的绑定关系，请选择一个本地用户进行绑定（或创建新用户）。
                </div>

                <Form
                    form={form}
                    layout="inline"
                    onFinish={async values => {
                        const user = await createLocalUser({ username: values.username })
                        await loginAsLocalUser({ id: user.id })
                        await bindPendingToLocalUser({ localUserId: user.id })
                        window.location.href = "/"
                    }}
                >
                    <FormItem name="username" rules={[{ required: true, message: "请输入用户名" }]}>
                        <Input placeholder="新用户名" />
                    </FormItem>
                    <Button type="primary" htmlType="submit">
                        创建并绑定
                    </Button>
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
                                                await bindPendingToLocalUser({ localUserId: value })
                                                window.location.href = "/"
                                            }}
                                        >
                                            选择并绑定
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
