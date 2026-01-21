"use client"

import { FC, Suspense, useEffect, useMemo, useState } from "react"

import { Button, Card, Descriptions, Spin } from "antd"
import { useSearchParams } from "next/navigation"

import { useConfirmOidcInteraction } from "@/hooks/useConfirmOidcInteraction"
import { useDenyOidcInteraction } from "@/hooks/useDenyOidcInteraction"
import { useGetOidcInteractionDetails } from "@/hooks/useGetOidcInteractionDetails"

const Content: FC = () => {
    const searchParams = useSearchParams()
    const uid = searchParams?.get("uid")?.trim()

    const [submitting, setSubmitting] = useState<"confirm" | "deny" | undefined>()

    const { data: details, isLoading, error } = useGetOidcInteractionDetails(uid, { enabled: !!uid })
    const confirmMutation = useConfirmOidcInteraction()
    const denyMutation = useDenyOidcInteraction()

    const scopes = useMemo(() => details?.missingOIDCScope?.join(" ") || "-", [details?.missingOIDCScope])
    const claims = useMemo(() => (details?.missingOIDCClaims?.length ? details.missingOIDCClaims.join(", ") : "-"), [details?.missingOIDCClaims])

    useEffect(() => {
        if (!error) return
        message.error(error.message || "加载失败")
    }, [error])

    if (!uid) return <div className="p-6">缺少 uid</div>

    return (
        <main className="p-6">
            <Card className="mx-auto max-w-xl" title="授权确认">
                <Spin spinning={isLoading}>
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Client ID">{details?.client?.client_id || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Client Name">{details?.client?.client_name || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Scopes">{scopes}</Descriptions.Item>
                        <Descriptions.Item label="Claims">{claims}</Descriptions.Item>
                    </Descriptions>
                    <div className="mt-4 flex gap-2">
                        <Button
                            type="primary"
                            disabled={isLoading || submitting !== undefined}
                            loading={submitting === "confirm"}
                            onClick={async () => {
                                try {
                                    setSubmitting("confirm")
                                    const { returnTo } = await confirmMutation.mutateAsync({ uid })
                                    window.location.href = returnTo
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
                            disabled={isLoading || submitting !== undefined}
                            loading={submitting === "deny"}
                            onClick={async () => {
                                try {
                                    setSubmitting("deny")
                                    const { returnTo } = await denyMutation.mutateAsync({ uid })
                                    window.location.href = returnTo
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
