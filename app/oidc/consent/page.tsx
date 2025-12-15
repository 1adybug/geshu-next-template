"use client"

import { FC, Suspense, useEffect, useMemo, useState } from "react"

import { Button, Card, Descriptions, Spin } from "antd"
import { useSearchParams } from "next/navigation"

type InteractionDetailsResponse = {
    uid: string
    prompt?: string
    client?: { client_id: string; client_name?: string }
    missingOIDCScope?: string[]
    missingOIDCClaims?: string[]
    missingResourceScopes?: Record<string, string[]>
}

async function postAndFollow(url: string) {
    const response = await fetch(url, { method: "POST", credentials: "include", headers: { accept: "application/json" } })

    if (!response.ok) {
        const data = (await response.json().catch(() => undefined)) as { message?: string } | undefined
        throw new Error(data?.message || "请求失败")
    }

    const data = (await response.json().catch(() => undefined)) as { returnTo?: string; message?: string } | undefined
    if (!data?.returnTo) throw new Error(data?.message || "请求失败")
    window.location.href = data.returnTo
}

const Content: FC = () => {
    const searchParams = useSearchParams()
    const uid = searchParams?.get("uid")?.trim()

    const [details, setDetails] = useState<InteractionDetailsResponse | undefined>()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState<"confirm" | "deny" | undefined>()

    const scopes = useMemo(() => details?.missingOIDCScope?.join(" ") || "-", [details?.missingOIDCScope])
    const claims = useMemo(() => (details?.missingOIDCClaims?.length ? details.missingOIDCClaims.join(", ") : "-"), [details?.missingOIDCClaims])

    useEffect(() => {
        if (!uid) return
        setLoading(true)

        fetch(`/api/oidc/interaction/${encodeURIComponent(uid)}/details`, { method: "GET" })
            .then(response => response.json())
            .then(setDetails)
            .catch(e => message.error(e?.message || "加载失败"))
            .finally(() => setLoading(false))
    }, [uid])

    if (!uid) return <div className="p-6">缺少 uid</div>

    return (
        <main className="p-6">
            <Card className="mx-auto max-w-xl" title="授权确认">
                <Spin spinning={loading}>
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Client ID">{details?.client?.client_id || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Client Name">{details?.client?.client_name || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Scopes">{scopes}</Descriptions.Item>
                        <Descriptions.Item label="Claims">{claims}</Descriptions.Item>
                    </Descriptions>
                    <div className="mt-4 flex gap-2">
                        <Button
                            type="primary"
                            disabled={loading || submitting !== undefined}
                            loading={submitting === "confirm"}
                            onClick={async () => {
                                try {
                                    setSubmitting("confirm")
                                    await postAndFollow(`/api/oidc/interaction/${encodeURIComponent(uid)}/confirm`)
                                } catch (e) {
                                    message.error((e as Error)?.message || "授权失败")
                                } finally {
                                    setSubmitting(undefined)
                                }
                            }}
                        >
                            允许
                        </Button>
                        <Button
                            danger
                            disabled={loading || submitting !== undefined}
                            loading={submitting === "deny"}
                            onClick={async () => {
                                try {
                                    setSubmitting("deny")
                                    await postAndFollow(`/api/oidc/interaction/${encodeURIComponent(uid)}/deny`)
                                } catch (e) {
                                    message.error((e as Error)?.message || "拒绝失败")
                                } finally {
                                    setSubmitting(undefined)
                                }
                            }}
                        >
                            拒绝
                        </Button>
                    </div>
                </Spin>
            </Card>
        </main>
    )
}

const Page: FC = () => (
    <Suspense fallback={<div className="p-6">加载中...</div>}>
        <Content />
    </Suspense>
)

export default Page
