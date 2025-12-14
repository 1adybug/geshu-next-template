import { Button, Card, Descriptions } from "antd"

import { tryGetEnv } from "@/server/env"
import { getLocalUser, getOidcLinkForLocalUser } from "@/server/localSession"

export const dynamic = "force-dynamic"

export default async function Page() {
    const env = tryGetEnv()
    const localUser = await getLocalUser()
    const link = localUser ? await getOidcLinkForLocalUser({ localUserId: localUser.id }) : undefined

    return (
        <main style={{ padding: 24 }}>
            <Card title="绑定模式（有本地用户体系）" style={{ maxWidth: 920, margin: "0 auto" }}>
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="本站登录状态">{localUser ? "已登录" : "未登录"}</Descriptions.Item>
                    <Descriptions.Item label="本地用户">{localUser ? `${localUser.username} (${localUser.id})` : "-"}</Descriptions.Item>
                    <Descriptions.Item label="绑定的 MyApp sub">{link?.sub || "-"}</Descriptions.Item>
                </Descriptions>

                <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                    <Button type="primary" href="/api/auth/login">
                        使用 MyApp 登录（会触发授权提示）
                    </Button>
                    <Button href="/local-users">本地用户管理</Button>
                    <Button href="/api/local/logout">退出本站</Button>
                    {env ? (
                        <Button type="link" href={`${env.MYAPP_OIDC_ISSUER}/.well-known/openid-configuration`}>
                            查看 MyApp Discovery
                        </Button>
                    ) : null}
                </div>
            </Card>
        </main>
    )
}
