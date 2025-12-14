"use client"

import { FC } from "react"

import { IconTrash } from "@tabler/icons-react"
import { Button, Popconfirm, Table } from "antd"
import { formatTime } from "deepsea-tools"
import { Columns } from "soda-antd"

import { ConnectedApp, useQueryConnectedApps, useRevokeConnectedApp } from "@/hooks/useConnectedApps"

import { uuid } from "@/utils/uuid"

const Page: FC = () => {
    const { data, isLoading } = useQueryConnectedApps()

    const { mutateAsync: revokeAsync, isPending: isRevoking } = useRevokeConnectedApp({
        onMutate() {
            const key = uuid()
            message.loading({ key, content: "正在撤销授权", duration: 0 })
            return key
        },
        onSuccess() {
            message.success("已撤销")
        },
        onError(e) {
            message.error(e.message || "撤销失败")
        },
        onSettled(_data, _error, _variables, key) {
            if (key) message.destroy(key)
        },
    })

    const isRequesting = isLoading || isRevoking

    const columns: Columns<ConnectedApp> = [
        {
            title: "应用",
            dataIndex: "client_name",
            align: "center",
            render(value: string | undefined, record) {
                return value || record.client_id
            },
        },
        {
            title: "Client ID",
            dataIndex: "client_id",
            align: "center",
        },
        {
            title: "权限（Scopes）",
            dataIndex: "scopes",
            render(value: string[]) {
                if (!Array.isArray(value) || value.length === 0) return "-"
                return value.join(" ")
            },
        },
        {
            title: "更新时间",
            dataIndex: "updatedAt",
            align: "center",
            render(value: string) {
                return formatTime(value)
            },
        },
        {
            title: "操作",
            dataIndex: "client_id",
            align: "center",
            render(value: string) {
                return (
                    <Popconfirm
                        title="确认撤销该应用的授权？"
                        description="撤销后，该应用持有的 Refresh Token 将失效（已登录的第三方站点不会被强制退出）。"
                        onConfirm={() => revokeAsync({ client_id: value })}
                    >
                        <Button size="small" shape="circle" color="danger" variant="text" disabled={isRequesting} icon={<IconTrash className="w-5" />} />
                    </Popconfirm>
                )
            },
        },
    ]

    return (
        <div className="p-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-base font-medium">已连接的应用</div>
                <Table<ConnectedApp> columns={columns} dataSource={data} loading={isLoading} rowKey="client_id" pagination={false} />
            </div>
        </div>
    )
}

export default Page
