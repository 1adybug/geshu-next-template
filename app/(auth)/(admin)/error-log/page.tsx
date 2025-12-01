"use client"

import { FC, useState } from "react"

import { Button, Form, Link, SortDescriptor, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import JsonView from "@uiw/react-json-view"
import { createRequestFn, formatTime, getEnumKey, isNonNullable, naturalParser } from "deepsea-tools"
import { FormInput } from "soda-heroui"
import { useQueryState } from "soda-next"

import { queryErrorLogAction } from "@/actions/queryErrorLog"

import Blackboard, { BlackboardProps } from "@/components/Blackboard"
import DateRangePicker from "@/components/DateRangePicker"
import Pagination from "@/components/Pagination"
import User from "@/components/User"

import { getParser } from "@/schemas"
import { ErrorLogSortByParams, errorLogSortBySchema } from "@/schemas/errorLogSortBy"
import { pageNumParser } from "@/schemas/pageNum"
import { pageSizeParser } from "@/schemas/pageSize"
import { Role } from "@/schemas/role"
import { sortOrderSchema } from "@/schemas/sortOrder"

import { getOnSubmit } from "@/utils/getOnSubmit"

const Page: FC = () => {
    const [query, setQuery] = useQueryState({
        keys: ["type", "message", "action", "ip", "userAgent", "username"],
        parse: {
            createdBefore: naturalParser,
            createdAfter: naturalParser,
            pageNum: pageNumParser,
            pageSize: pageSizeParser,
            sortBy: getParser(errorLogSortBySchema.optional().catch(undefined)),
            sortOrder: getParser(sortOrderSchema.optional().catch(undefined)),
        },
    })

    const [info, setInfo] = useState<Pick<BlackboardProps, "header" | "body">>()

    const sortDescriptor: SortDescriptor | undefined = query.sortBy && {
        column: query.sortBy,
        direction: query.sortOrder === "desc" ? "descending" : "ascending",
    }

    function onSortChange({ column, direction }: SortDescriptor) {
        setQuery(prev => ({ ...prev, sortBy: column as ErrorLogSortByParams, sortOrder: direction === "descending" ? "desc" : "asc" }))
    }

    function getFormValues({ type, message, action, ip, userAgent, username, createdBefore, createdAfter }: typeof query) {
        return {
            type,
            message,
            action,
            ip,
            userAgent,
            username,
            created: (isNonNullable(createdBefore) && isNonNullable(createdAfter) ? [createdAfter, createdBefore] : undefined) as [number, number] | undefined,
        } as const
    }

    const form = useForm({
        defaultValues: getFormValues(query),
        onSubmit({ value: { type, message, action, ip, userAgent, username, created } }) {
            setQuery({
                type,
                message,
                action,
                ip,
                userAgent,
                username,
                createdBefore: created?.[0],
                createdAfter: created?.[1],
            })
        },
    })

    const { data, isLoading } = useQuery({
        queryKey: ["query-error-log", query],
        async queryFn() {
            const { createdBefore, createdAfter, ...rest } = query
            return createRequestFn(queryErrorLogAction)({
                createdBefore: isNonNullable(createdBefore) ? new Date(createdBefore) : undefined,
                createdAfter: isNonNullable(createdAfter) ? new Date(createdAfter) : undefined,
                ...rest,
            })
        },
    })

    const isRequesting = isLoading

    return (
        <div className="pt-4">
            <div className="px-4">
                <Form className="flex-row" onSubmit={getOnSubmit(form)}>
                    <form.Field name="type">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="类型"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="message">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="消息"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="action">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="函数名"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
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
                    <form.Field name="ip">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="IP"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="userAgent">
                        {field => (
                            <FormInput
                                classNames={{ mainWrapper: "w-36" }}
                                size="sm"
                                field={field}
                                fullWidth={false}
                                label="UserAgent"
                                labelPlacement="outside-left"
                                autoComplete="off"
                                isClearable
                            />
                        )}
                    </form.Field>
                    <form.Field name="created">
                        {field => (
                            <DateRangePicker
                                classNames={{ base: "!pb-0" }}
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
                    <Button type="submit" color="primary" size="sm" isDisabled={isRequesting}>
                        查询
                    </Button>
                    <Button type="button" variant="flat" size="sm" isDisabled={isRequesting} onPress={() => setQuery({})}>
                        重置
                    </Button>
                </Form>
            </div>
            <div className="mt-4 px-4">
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
                    aria-label="错误日志列表"
                    sortDescriptor={sortDescriptor}
                    onSortChange={onSortChange}
                >
                    <TableHeader>
                        <TableColumn align="center">序号</TableColumn>
                        <TableColumn allowsSorting key="username" align="center">
                            用户
                        </TableColumn>
                        <TableColumn align="center">手机号</TableColumn>
                        <TableColumn align="center">角色</TableColumn>
                        <TableColumn allowsSorting key="type" align="center">
                            类型
                        </TableColumn>
                        <TableColumn align="center">消息</TableColumn>
                        <TableColumn align="center">堆栈</TableColumn>
                        <TableColumn allowsSorting key="action" align="center">
                            操作
                        </TableColumn>
                        <TableColumn align="center">参数</TableColumn>
                        <TableColumn allowsSorting key="ip" align="center">
                            IP
                        </TableColumn>
                        <TableColumn align="center" className="w-80">
                            UserAgent
                        </TableColumn>
                        <TableColumn allowsSorting key="createdAt" align="center">
                            时间
                        </TableColumn>
                    </TableHeader>
                    <TableBody items={data?.list.map((item, index) => ({ ...item, index })) ?? []} isLoading={isLoading} emptyContent="暂无数据">
                        {({ index, id, createdAt, type, message, stack, action, params, ip, userAgent, username, phone, role, userId }) => (
                            <TableRow key={id}>
                                <TableCell>{data!.pageSize * (data!.pageNum - 1) + index + 1}</TableCell>
                                <TableCell>{userId && username ? <User data={{ id: userId, username }} /> : "—"}</TableCell>
                                <TableCell>{phone || "—"}</TableCell>
                                <TableCell>{(role && getEnumKey(Role, role)) || "—"}</TableCell>
                                <TableCell>{type}</TableCell>
                                <TableCell title={message}>
                                    {message ? (
                                        <Link
                                            size="sm"
                                            className="line-clamp-1 max-w-48 cursor-pointer break-all"
                                            onPress={() => setInfo({ header: "错误消息", body: message })}
                                        >
                                            {message}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {stack ? (
                                        <Link
                                            size="sm"
                                            className="line-clamp-1 max-w-48 cursor-pointer break-all"
                                            onPress={() => setInfo({ header: "错误堆栈", body: stack })}
                                        >
                                            {stack}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell>{action}</TableCell>
                                <TableCell>
                                    {params ? (
                                        <Link
                                            size="sm"
                                            className="line-clamp-1 max-w-48 cursor-pointer break-all"
                                            onPress={() =>
                                                setInfo({
                                                    header: "错误参数",
                                                    body: <JsonView className="!font-['Source_Han_Sans_VF']" value={JSON.parse(params)} />,
                                                })
                                            }
                                        >
                                            {params}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell>{ip}</TableCell>
                                <TableCell>{userAgent ?? "—"}</TableCell>
                                <TableCell>{formatTime(createdAt)}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default Page
