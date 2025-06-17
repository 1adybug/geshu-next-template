import { getPagination } from "deepsea-tools"

import { prisma } from "@/prisma"
import { QueryMode } from "@/prisma/generated/internal/prismaNamespace"
import { getUserWhere } from "@/prisma/getUserWhere"

import { QueryUserParams } from "@/schemas/queryUser"

export async function queryUser({
    username = "",
    phone = "",
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    pageNum = 1,
    pageSize = 10,
}: QueryUserParams) {
    username = username.trim()
    phone = phone.trim()

    const where = getUserWhere({
        phone: phone ? { contains: phone } : undefined,
        createdAt: {
            gte: createdAfter,
            lte: createdBefore,
        },
        updatedAt: {
            gte: updatedAfter,
            lte: updatedBefore,
        },
        AND: [
            ...username.split(" ").map(item => ({
                username: {
                    contains: item,
                    mode: QueryMode.insensitive,
                },
            })),
        ],
    })

    const data = await prisma.user.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
    })

    const total = await prisma.user.count({ where })

    return getPagination({
        data,
        total,
        pageNum,
        pageSize,
    })
}
