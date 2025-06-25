import { getPagination } from "deepsea-tools"

import { prisma } from "@/prisma"
import { ErrorLogOrderByWithRelationInput, QueryMode } from "@/prisma/generated/internal/prismaNamespace"
import { getErrorLogWhere } from "@/prisma/getErrorLogWhere"

import { defaultPageNum } from "@/schemas/pageNum"
import { defaultPageSize } from "@/schemas/pageSize"
import { QueryErrorLogParams } from "@/schemas/queryErrorLog"

export async function queryErrorLog({
    createdBefore,
    createdAfter,
    type = "",
    message = "",
    action = "",
    ip = "",
    userAgent = "",
    username = "",
    pageNum = defaultPageNum,
    pageSize = defaultPageSize,
    sortBy = "createdAt",
    sortOrder = "desc",
}: QueryErrorLogParams) {
    const where = getErrorLogWhere({
        AND: [
            ...type
                .split(" ")
                .filter(Boolean)
                .map(item => ({ type: { contains: item, mode: QueryMode.insensitive } })),
            ...message
                .split(" ")
                .filter(Boolean)
                .map(item => ({ message: { contains: item, mode: QueryMode.insensitive } })),
            ...action
                .split(" ")
                .filter(Boolean)
                .map(item => ({ action: { contains: item, mode: QueryMode.insensitive } })),
            ...ip
                .split(" ")
                .filter(Boolean)
                .map(item => ({ ip: { contains: item, mode: QueryMode.insensitive } })),
            ...userAgent
                .split(" ")
                .filter(Boolean)
                .map(item => ({ userAgent: { contains: item, mode: QueryMode.insensitive } })),
            ...username
                .split(" ")
                .filter(Boolean)
                .map(item => ({ username: { contains: item, mode: QueryMode.insensitive } })),
        ],
        createdAt: {
            gte: createdAfter,
            lte: createdBefore,
        },
    })

    const orderBy: ErrorLogOrderByWithRelationInput[] = [
        {
            createdAt: sortBy === "createdAt" ? sortOrder : "asc",
        },
    ]

    if (sortBy !== "createdAt") {
        if (sortBy === "action" || sortBy === "ip" || sortBy === "userAgent" || sortBy === "type") {
            orderBy.unshift({
                [sortBy]: sortOrder,
            })
        } else if (sortBy === "username") {
            orderBy.unshift({
                user: {
                    username: sortOrder,
                },
            })
        }
    }

    const data = await prisma.errorLog.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: {
            user: true,
        },
    })

    const total = await prisma.errorLog.count({
        where,
    })

    return getPagination({
        data,
        exact: true,
        total,
        pageNum,
        pageSize,
    })
}
