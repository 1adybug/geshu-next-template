import { Button, Card, Descriptions } from "antd"
import Link from "next/link"

import { getSession } from "@/server/session"

export default async function Page() {
    const session = await getSession()

    return (
        <main style={{ padding: 24 }}>
            <Card title="纯依赖模式（无本地用户体系）" style={{ maxWidth: 840, margin: "0 auto" }}>
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="登录状态">{session ? "已登录" : "未登录"}</Descriptions.Item>
                    <Descriptions.Item label="MyApp sub">{session?.sub || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Scopes">{session?.scope || "-"}</Descriptions.Item>
                </Descriptions>

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                    {!session ? (
                        <Button type="primary" href="/api/auth/login">
                            使用 MyApp 登录
                        </Button>
                    ) : (
                        <>
                            <Button href="/api/auth/logout">退出（仅退出本站）</Button>
                            <Button type="link">
                                <Link href="/api/me">查看受保护资源（示例）</Link>
                            </Button>
                        </>
                    )}
                </div>
            </Card>
        </main>
    )
}
