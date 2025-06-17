"use client"

import { FC, useEffect, useState } from "react"
import { Button, Form, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { createRequestFn, formatTime, isNonNullable, naturalParser, positiveIntParser } from "deepsea-tools"
import { FormInput } from "soda-heroui"
import { useQueryState } from "soda-next"

import { queryUserAction } from "@/actions/queryUser"

import Pagination from "@/components/Pagination"
import { DateRangePicker } from "@/components/RangePicker"
import UserEditor from "@/components/UserEditor"

const Page: FC = () => {
    const [query, setQuery] = useQueryState({
        keys: ["username", "phone"],
        parse: {
            createdBefore: positiveIntParser,
            createdAfter: positiveIntParser,
            updatedBefore: positiveIntParser,
            updatedAfter: positiveIntParser,
            pageNum: naturalParser,
            pageSize: naturalParser,
        },
    })

    const [editId, setEditId] = useState<string | undefined>(undefined)
    const [showEditor, setShowEditor] = useState(false)

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

    function getFormValues({ username, phone, createdBefore, createdAfter, updatedBefore, updatedAfter }: typeof query) {
        return {
            username,
            phone,
            created: (isNonNullable(createdBefore) && isNonNullable(createdAfter) ? [createdAfter, createdBefore] : undefined) as [number, number] | undefined,
            updated: (isNonNullable(updatedBefore) && isNonNullable(updatedAfter) ? [updatedAfter, updatedBefore] : undefined) as [number, number] | undefined,
        } as const
    }

    const form = useForm({
        defaultValues: getFormValues(query),
        onSubmit({ value: { username, phone, created, updated } }) {
            setQuery({
                username,
                phone,
                createdAfter: created?.[0],
                createdBefore: created?.[1],
                updatedAfter: updated?.[0],
                updatedBefore: updated?.[1],
                pageNum: 1,
            })
        },
    })

    useEffect(() => form.reset(getFormValues(query)), [query])

    const { data, isLoading } = useQuery({
        queryKey: ["query-user", query],
        async queryFn() {
            const { createdBefore, createdAfter, updatedBefore, updatedAfter, ...rest } = query
            return createRequestFn(queryUserAction)({
                createdBefore: isNonNullable(createdBefore) ? new Date(createdBefore) : undefined,
                createdAfter: isNonNullable(createdAfter) ? new Date(createdAfter) : undefined,
                updatedBefore: isNonNullable(updatedBefore) ? new Date(updatedBefore) : undefined,
                updatedAfter: isNonNullable(updatedAfter) ? new Date(updatedAfter) : undefined,
                ...rest,
            })
        },
    })

    return (
        <div className="pt-4">
            <div className="px-4">
                <Form className="flex-row" onSubmit={() => form.handleSubmit()}>
                    <form.Field name="username">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="用户名"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="phone">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="手机号"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="created">
                        {field => (
                            <DateRangePicker
                                size="sm"
                                field={field}
                                fullWidth={false}
                                hideTimeZone
                                label="创建时间"
                                aria-label="创建时间"
                                labelPlacement="outside-left"
                            />
                        )}
                    </form.Field>
                    <form.Field name="updated">
                        {field => (
                            <DateRangePicker
                                size="sm"
                                field={field}
                                fullWidth={false}
                                hideTimeZone
                                label="更新时间"
                                aria-label="更新时间"
                                labelPlacement="outside-left"
                            />
                        )}
                    </form.Field>
                    <Button type="button" color="primary" size="sm" isDisabled={isLoading} onPress={() => form.handleSubmit()}>
                        查询
                    </Button>
                    <Button type="button" variant="light" size="sm" isDisabled={isLoading} onPress={() => setQuery({})}>
                        重置
                    </Button>
                    <Button className="ml-auto" size="sm" color="primary" isDisabled={isLoading} onPress={onAdd}>
                        新增
                    </Button>
                </Form>
            </div>
            <div className="px-4">
                <UserEditor id={editId} isOpen={showEditor} onClose={onClose} />
                <Table
                    bottomContent={
                        <Pagination
                            pageSize={data?.pageSize ?? 10}
                            pageNum={data?.pageNum ?? 1}
                            total={data?.pages ?? 1}
                            onPageSizeChange={value => setQuery(prev => ({ ...prev, pageSize: value, pageNum: 1 }))}
                            onPageNumChange={value => setQuery(prev => ({ ...prev, pageNum: value }))}
                        />
                    }
                >
                    <TableHeader>
                        <TableColumn align="center">序号</TableColumn>
                        <TableColumn align="center">用户名</TableColumn>
                        <TableColumn align="center">手机号</TableColumn>
                        <TableColumn align="center">创建时间</TableColumn>
                        <TableColumn align="center">更新时间</TableColumn>
                        <TableColumn align="center">操作</TableColumn>
                    </TableHeader>
                    <TableBody items={data?.list.map((item, index) => ({ ...item, index })) ?? []}>
                        {({ index, id, username, phone, createdAt, updatedAt }) => (
                            <TableRow key={id}>
                                <TableCell>{data!.pageSize * (data!.pageNum - 1) + index + 1}</TableCell>
                                <TableCell>{username}</TableCell>
                                <TableCell>{phone}</TableCell>
                                <TableCell>{formatTime(createdAt)}</TableCell>
                                <TableCell>{formatTime(updatedAt)}</TableCell>
                                <TableCell>
                                    <div className="inline-flex gap-2">
                                        <Button size="sm" variant="flat" radius="full" isIconOnly isDisabled={isLoading} onPress={() => onUpdate(id)}>
                                            <IconEdit className="w-5 text-foreground-500" />
                                        </Button>
                                        <Button size="sm" variant="flat" radius="full" isIconOnly isDisabled={isLoading} onPress={() => {}}>
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
