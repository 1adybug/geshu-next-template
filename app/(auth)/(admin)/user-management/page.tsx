"use client"

import { FC, useState } from "react"
import { Button, Form, SortDescriptor, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createRequestFn, formatTime, getEnumKey, isNonNullable, naturalParser, positiveIntParser } from "deepsea-tools"
import { FormInput, addBetterToast, closeToast } from "soda-heroui"
import { useQueryState } from "soda-next"

import { deleteUserAction } from "@/actions/deleteUser"
import { queryUserAction } from "@/actions/queryUser"

import Confirm from "@/components/Confirm"
import DateRangePicker from "@/components/DateRangePicker"
import Pagination from "@/components/Pagination"
import UserEditor from "@/components/UserEditor"

import { getParser } from "@/schemas"
import { Role } from "@/schemas/role"
import { sortOrderSchema } from "@/schemas/sortOrder"
import { UserSortByParams, userSortBySchema } from "@/schemas/userSortBy"

import { getOnSubmit } from "@/utils/getOnSubmit"

const Page: FC = () => {
    const queryClient = useQueryClient()

    const [query, setQuery] = useQueryState({
        keys: ["id", "username", "phone"],
        parse: {
            createdBefore: naturalParser,
            createdAfter: naturalParser,
            updatedBefore: naturalParser,
            updatedAfter: naturalParser,
            pageNum: positiveIntParser,
            pageSize: positiveIntParser,
            sortBy: getParser(userSortBySchema.optional().catch(undefined)),
            sortOrder: getParser(sortOrderSchema.optional().catch(undefined)),
        },
    })

    const [editId, setEditId] = useState<string | undefined>(undefined)
    const [showEditor, setShowEditor] = useState(false)
    const [deleteUserId, setDeleteUserId] = useState<string | undefined>(undefined)

    const sortDescriptor: SortDescriptor | undefined = query.sortBy && {
        column: query.sortBy,
        direction: query.sortOrder === "desc" ? "descending" : "ascending",
    }

    function onSortChange({ column, direction }: SortDescriptor) {
        setQuery(prev => ({ ...prev, sortBy: column as UserSortByParams, sortOrder: direction === "descending" ? "desc" : "asc" }))
    }

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
                id: undefined,
                username,
                phone,
                createdBefore: created?.[0],
                createdAfter: created?.[1],
                updatedBefore: updated?.[0],
                updatedAfter: updated?.[1],
            })
        },
    })

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

    const mutationFn = createRequestFn(deleteUserAction)

    const { mutateAsync: deleteUser, isPending: isDeleteUserPending } = useMutation({
        mutationFn,
        onMutate() {
            setDeleteUserId(undefined)
            const key = addBetterToast({
                title: "删除用户",
                description: "正在删除用户",
            })
            return key
        },
        onSuccess() {
            addBetterToast({
                title: "删除成功",
                color: "success",
            })
        },
        onSettled(data, error, variables, context) {
            closeToast(context!)
            queryClient.invalidateQueries({ queryKey: ["query-user"] })
            queryClient.invalidateQueries({ queryKey: ["get-all-users"] })
            queryClient.invalidateQueries({ queryKey: ["query-repository"] })
        },
    })

    const isRequesting = isLoading || isDeleteUserPending

    return (
        <div className="pt-4">
            <div className="px-4">
                <Form className="flex-row" onSubmit={getOnSubmit(form)}>
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
                    <Button type="submit" color="primary" size="sm" isDisabled={isRequesting}>
                        查询
                    </Button>
                    <Button type="button" variant="flat" size="sm" isDisabled={isRequesting} onPress={() => setQuery({})}>
                        重置
                    </Button>
                    <Button className="ml-auto" size="sm" color="primary" isDisabled={isRequesting} onPress={onAdd}>
                        新增
                    </Button>
                </Form>
            </div>
            <div className="px-4">
                <UserEditor id={editId} isOpen={showEditor} onClose={onClose} />
                <Confirm
                    title="确认删除用户？"
                    description="请在删除用户前，确保已备份相关数据。"
                    onConfirm={() => deleteUser(deleteUserId!)}
                    isOpen={isNonNullable(deleteUserId)}
                    onClose={() => setDeleteUserId(undefined)}
                />
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
                    aria-label="用户列表"
                    sortDescriptor={sortDescriptor}
                    onSortChange={onSortChange}
                >
                    <TableHeader>
                        <TableColumn align="center">序号</TableColumn>
                        <TableColumn key="username" allowsSorting align="center">
                            用户名
                        </TableColumn>
                        <TableColumn key="phone" allowsSorting align="center">
                            手机号
                        </TableColumn>
                        <TableColumn key="role" allowsSorting align="center">
                            角色
                        </TableColumn>
                        <TableColumn key="createdAt" allowsSorting align="center">
                            创建时间
                        </TableColumn>
                        <TableColumn key="updatedAt" allowsSorting align="center">
                            更新时间
                        </TableColumn>
                        <TableColumn align="center">操作</TableColumn>
                    </TableHeader>
                    <TableBody items={data?.list.map((item, index) => ({ ...item, index })) ?? []} isLoading={isLoading} emptyContent="暂无数据">
                        {({ index, id, username, phone, role, createdAt, updatedAt }) => (
                            <TableRow key={id}>
                                <TableCell>{data!.pageSize * (data!.pageNum - 1) + index + 1}</TableCell>
                                <TableCell>{username}</TableCell>
                                <TableCell>{phone}</TableCell>
                                <TableCell>{getEnumKey(Role, role)}</TableCell>
                                <TableCell>{formatTime(createdAt)}</TableCell>
                                <TableCell>{formatTime(updatedAt)}</TableCell>
                                <TableCell>
                                    <div className="inline-flex gap-2">
                                        <Button size="sm" variant="flat" radius="full" isIconOnly isDisabled={isRequesting} onPress={() => onUpdate(id)}>
                                            <IconEdit className="w-5 text-foreground-500" />
                                        </Button>
                                        <Button size="sm" variant="flat" radius="full" isIconOnly isDisabled={isRequesting} onPress={() => setDeleteUserId(id)}>
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
