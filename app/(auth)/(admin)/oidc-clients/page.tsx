"use client"

import { FC, useState } from "react"

import { IconEdit, IconTrash } from "@tabler/icons-react"
import { Button, Popconfirm, Table } from "antd"
import { formatTime } from "deepsea-tools"
import { Columns } from "soda-antd"

import OidcClientEditor from "@/components/OidcClientEditor"

import { OidcClientRecord, useDeleteOidcClient, useQueryOidcClients } from "@/hooks/useOidcClients"

import { uuid } from "@/utils/uuid"

const Page: FC = () => {
    const [editId, setEditId] = useState<string | undefined>(undefined)
    const [showEditor, setShowEditor] = useState(false)

    const { data, isLoading } = useQueryOidcClients()

    const { mutateAsync: deleteAsync, isPending: isDeletePending } = useDeleteOidcClient({
        onMutate() {
            const key = uuid()
            message.loading({ key, content: "正在删除", duration: 0 })
            return key
        },
        onSuccess() {
            message.success("删除成功")
        },
        onError(e) {
            message.error(e.message || "删除失败")
        },
        onSettled(_data, _error, _variables, key) {
            if (key) message.destroy(key)
        },
    })

    const isRequesting = isLoading || isDeletePending

    const columns: Columns<OidcClientRecord> = [
        {
            title: "Client ID",
            dataIndex: "client_id",
            align: "center",
        },
        {
            title: "名称",
            dataIndex: "client_name",
            align: "center",
            render(value: string | null | undefined) {
                return value?.trim() ? value : "-"
            },
        },
        {
            title: "Redirect URIs",
            dataIndex: "redirect_uris",
            render(value: string[]) {
                if (!Array.isArray(value) || value.length === 0) return "-"
                return (
                    <div className="font-mono text-xs">
                        {value.map(v => (
                            <div key={v} className="break-all">
                                {v}
                            </div>
                        ))}
                    </div>
                )
            },
        },
        {
            title: "Grant Types",
            dataIndex: "grant_types",
            align: "center",
            render(value: string[]) {
                return Array.isArray(value) ? value.join(", ") : "-"
            },
        },
        {
            title: "Scope",
            dataIndex: "scope",
            align: "center",
            render(value: unknown) {
                return typeof value === "string" && value.trim() ? value : "-"
            },
        },
        {
            title: "第一方",
            dataIndex: "is_first_party",
            align: "center",
            render(value: boolean) {
                return value ? "是" : "否"
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
            key: "operation",
            dataIndex: "client_id",
            align: "center",
            render(value: string) {
                return (
                    <div className="inline-flex gap-2">
                        <Button
                            size="small"
                            shape="circle"
                            color="default"
                            variant="text"
                            disabled={isRequesting}
                            icon={<IconEdit className="w-5" />}
                            onClick={() => onUpdate(value)}
                        />
                        <Popconfirm
                            title="确认删除接入方"
                            description="删除后，该第三方将无法继续使用本 IdP 登录"
                            onConfirm={() => deleteAsync({ client_id: value })}
                        >
                            <Button size="small" shape="circle" color="danger" variant="text" disabled={isRequesting} icon={<IconTrash className="w-5" />} />
                        </Popconfirm>
                    </div>
                )
            },
        },
    ]

    function onAdd() {
        setEditId(undefined)
        setShowEditor(true)
    }

    function onUpdate(id: string) {
        setEditId(id)
        setShowEditor(true)
    }

    function onClose() {
        setEditId(undefined)
        setShowEditor(false)
    }

    return (
        <div className="pt-4">
            <div className="flex items-center gap-2 px-4">
                <div className="text-base font-medium">第三方接入管理（OIDC Clients）</div>
                <Button className="ml-auto" color="primary" disabled={isRequesting} onClick={onAdd}>
                    新增
                </Button>
            </div>

            <div className="mt-4 px-4">
                <OidcClientEditor clientId={editId} open={showEditor} onClose={onClose} />
                <Table<OidcClientRecord> columns={columns} dataSource={data} loading={isLoading} rowKey="client_id" pagination={false} />
            </div>
        </div>
    )
}

export default Page
