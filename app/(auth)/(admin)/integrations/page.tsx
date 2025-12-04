"use client"

import { FC, useState } from "react"

import { Button, Chip, Form, Link, SelectItem, SortDescriptor, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { IconCopy, IconEdit, IconKey, IconTrash } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import JsonView from "@uiw/react-json-view"
import { createRequestFn, formatTime, isNonNullable, naturalParser } from "deepsea-tools"
import { addBetterToast, closeToast, FormInput, FormSelect } from "soda-heroui"
import { useQueryState } from "soda-next"

import { deleteOidcClientAction } from "@/actions/deleteOidcClient"
import { queryOidcClientAction } from "@/actions/queryOidcClient"
import { rotateOidcClientSecretAction } from "@/actions/rotateOidcClientSecret"

import Blackboard, { BlackboardProps } from "@/components/Blackboard"
import Confirm from "@/components/Confirm"
import OidcClientEditor from "@/components/OidcClientEditor"
import Pagination from "@/components/Pagination"

import { getParser } from "@/schemas"
import { OidcClientSortByParams, oidcClientSortBySchema } from "@/schemas/oidcClientSortBy"
import { pageNumParser } from "@/schemas/pageNum"
import { pageSizeParser } from "@/schemas/pageSize"
import { sortOrderSchema } from "@/schemas/sortOrder"

import { getOnSubmit } from "@/utils/getOnSubmit"

type EnabledFilter = "all" | "true" | "false"

function booleanParser(value: unknown) {
    if (value === "true") return true
    if (value === "false") return false
    return undefined
}

const Page: FC = () => {
    const queryClient = useQueryClient()

    const [query, setQuery] = useQueryState({
        keys: ["name", "clientId"],
        parse: {
            enabled: booleanParser,
            updatedBefore: naturalParser,
            updatedAfter: naturalParser,
            pageNum: pageNumParser,
            pageSize: pageSizeParser,
            sortBy: getParser(oidcClientSortBySchema.optional().catch(undefined)),
            sortOrder: getParser(sortOrderSchema.optional().catch(undefined)),
        },
    })

    const [editId, setEditId] = useState<string | undefined>()
    const [showEditor, setShowEditor] = useState(false)
    const [deleteId, setDeleteId] = useState<string | undefined>()
    const [resetId, setResetId] = useState<string | undefined>()
    const [info, setInfo] = useState<Pick<BlackboardProps, "header" | "body">>()

    const sortDescriptor: SortDescriptor | undefined = query.sortBy && {
        column: query.sortBy,
        direction: query.sortOrder === "desc" ? "descending" : "ascending",
    }

    function onSortChange({ column, direction }: SortDescriptor) {
        setQuery(prev => ({ ...prev, sortBy: column as OidcClientSortByParams, sortOrder: direction === "descending" ? "desc" : "asc" }))
    }

    function getFormValues({ name, clientId, enabled }: typeof query) {
        return {
            name,
            clientId,
            enabled: enabled === undefined ? ("all" as EnabledFilter) : enabled ? "true" : "false",
        }
    }

    const form = useForm({
        defaultValues: getFormValues(query),
        onSubmit({ value: { name, clientId, enabled } }) {
            setQuery({
                name,
                clientId,
                enabled: enabled === "all" ? undefined : enabled === "true",
            })
        },
    })

    const { data, isLoading } = useQuery({
        queryKey: ["query-oidc-client", query],
        async queryFn() {
            const { updatedBefore, updatedAfter, ...rest } = query
            return createRequestFn(queryOidcClientAction)({
                updatedBefore: isNonNullable(updatedBefore) ? new Date(updatedBefore) : undefined,
                updatedAfter: isNonNullable(updatedAfter) ? new Date(updatedAfter) : undefined,
                ...rest,
            })
        },
    })

    const deleteOidcClient = createRequestFn(deleteOidcClientAction)

    const { mutateAsync: deleteClient, isPending: isDeletePending } = useMutation({
        mutationFn: deleteOidcClient,
        onMutate() {
            setDeleteId(undefined)

            const key = addBetterToast({
                title: "删除客户端",
                description: "正在删除客户端",
            })

            return key
        },
        onSuccess() {
            addBetterToast({
                title: "删除成功",
                color: "success",
            })
        },
        onSettled(_data, _error, _variables, context) {
            closeToast(context!)
            queryClient.invalidateQueries({ queryKey: ["query-oidc-client"] })
        },
    })

    const rotateOidcClientSecret = createRequestFn(rotateOidcClientSecretAction)

    const { mutateAsync: rotateSecret, isPending: isRotatePending } = useMutation({
        mutationFn: rotateOidcClientSecret,
        onMutate() {
            setResetId(undefined)

            const key = addBetterToast({
                title: "重置密钥",
                description: "正在重置密钥",
            })

            return key
        },
        onSuccess(data) {
            addBetterToast({
                title: "密钥已重置",
                description: data.clientSecret,
                color: "success",
            })

            setInfo({
                header: `${data.name} 的新密钥`,
                body: (
                    <div className="break-words font-mono text-sm">
                        <div className="mb-2 text-xs text-foreground-500">client_id</div>
                        <div className="mb-4">{data.clientId}</div>
                        <div className="mb-2 text-xs text-foreground-500">client_secret</div>
                        <div>{data.clientSecret}</div>
                    </div>
                ),
            })
        },
        onSettled(_data, _error, _variables, context) {
            closeToast(context!)
            queryClient.invalidateQueries({ queryKey: ["query-oidc-client"] })
        },
    })

    function onAdd() {
        setEditId(undefined)
        setShowEditor(true)
    }

    function onUpdate(id: string) {
        setEditId(id)
        setShowEditor(true)
    }

    function onCloseEditor() {
        setEditId(undefined)
        setShowEditor(false)
    }

    const isRequesting = isLoading || isDeletePending || isRotatePending

    return (
        <div className="pt-4">
            <div className="px-4">
                <Form className="flex-row" onSubmit={getOnSubmit(form)}>
                    <form.Field name="name">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-40" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="名称"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="clientId">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-44" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="Client ID"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="enabled">
                        {field => (
                            <FormSelect
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="状态"
                                labelPlacement="outside-left"
                            >
                                <SelectItem key="all">全部</SelectItem>
                                <SelectItem key="true">启用</SelectItem>
                                <SelectItem key="false">停用</SelectItem>
                            </FormSelect>
                        )}
                    </form.Field>
                    <Button type="submit" color="primary" size="sm" isDisabled={isRequesting}>
                        查询
                    </Button>
                    <Button type="button" variant="flat" size="sm" isDisabled={isRequesting} onPress={() => setQuery({})}>
                        重置
                    </Button>
                    <Button className="ml-auto" size="sm" color="primary" isDisabled={isRequesting} onPress={onAdd}>
                        新增客户端
                    </Button>
                </Form>
            </div>
            <div className="mt-4 px-4">
                <OidcClientEditor id={editId} isOpen={showEditor} onClose={onCloseEditor} />
                <Confirm
                    title="确认删除客户端？"
                    description="删除后不可恢复，请确认该客户端已下线。"
                    onConfirm={() => deleteClient(deleteId!)}
                    isOpen={isNonNullable(deleteId)}
                    onClose={() => setDeleteId(undefined)}
                />
                <Confirm
                    title="确认重置密钥？"
                    description="重置后旧密钥立即失效，需同步到第三方。"
                    onConfirm={() => rotateSecret(resetId!)}
                    isOpen={isNonNullable(resetId)}
                    onClose={() => setResetId(undefined)}
                />
                <Blackboard isOpen={isNonNullable(info)} onClose={() => setInfo(undefined)} {...info} />
                <Table
                    bottomContent={
                        <Pagination
                            pageSize={query.pageSize}
                            pageNum={query.pageNum}
                            total={data?.total ?? 1}
                            onPageSizeChange={value => setQuery(prev => ({ ...prev, pageSize: value, pageNum: 1 }))}
                            onPageNumChange={value => setQuery(prev => ({ ...prev, pageNum: value }))}
                        />
                    }
                    aria-label="第三方客户端列表"
                    sortDescriptor={sortDescriptor}
                    onSortChange={onSortChange}
                >
                    <TableHeader>
                        <TableColumn align="center">序号</TableColumn>
                        <TableColumn key="name" allowsSorting align="center">
                            名称
                        </TableColumn>
                        <TableColumn key="clientId" allowsSorting align="center">
                            Client ID
                        </TableColumn>
                        <TableColumn key="enabled" allowsSorting align="center">
                            状态
                        </TableColumn>
                        <TableColumn align="center">回调地址</TableColumn>
                        <TableColumn key="updatedAt" allowsSorting align="center">
                            更新时间
                        </TableColumn>
                        <TableColumn align="center">操作</TableColumn>
                    </TableHeader>
                    <TableBody items={data?.list.map((item, index) => ({ ...item, index })) ?? []} isLoading={isLoading} emptyContent="暂无数据">
                        {({ index, id, name, clientId, clientSecret, redirectUris, grantTypes, responseTypes, enabled, updatedAt }) => (
                            <TableRow key={id}>
                                <TableCell>{data!.pageSize * (data!.pageNum - 1) + index + 1}</TableCell>
                                <TableCell>{name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm">{clientId}</span>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            isIconOnly
                                            radius="full"
                                            onPress={() => navigator.clipboard.writeText(clientId)}
                                            isDisabled={isRequesting}
                                        >
                                            <IconCopy className="w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip size="sm" color={enabled ? "success" : "default"} variant="flat">
                                        {enabled ? "启用" : "停用"}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    {redirectUris.length > 0 ? (
                                        <Link
                                            size="sm"
                                            className="max-w-64 cursor-pointer truncate"
                                            onPress={() =>
                                                setInfo({
                                                    header: `${name} 的回调地址`,
                                                    body: (
                                                        <JsonView
                                                            className="!font-['Source_Han_Sans_VF']"
                                                            value={{ redirect_uris: redirectUris, grant_types: grantTypes, response_types: responseTypes }}
                                                        />
                                                    ),
                                                })
                                            }
                                        >
                                            {redirectUris[0]}
                                            {redirectUris.length > 1 ? ` 等${redirectUris.length}个` : ""}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell>{formatTime(updatedAt)}</TableCell>
                                <TableCell>
                                    <div className="inline-flex gap-2">
                                        <Button size="sm" variant="flat" radius="full" isIconOnly isDisabled={isRequesting} onPress={() => onUpdate(id)}>
                                            <IconEdit className="w-5 text-foreground-500" />
                                        </Button>
                                        <Button size="sm" variant="flat" radius="full" isIconOnly isDisabled={isRequesting} onPress={() => setResetId(id)}>
                                            <IconKey className="w-5 text-foreground-500" />
                                        </Button>
                                        <Button size="sm" variant="flat" radius="full" isIconOnly isDisabled={isRequesting} onPress={() => setDeleteId(id)}>
                                            <IconTrash className="w-5 text-foreground-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default Page
