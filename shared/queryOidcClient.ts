import { getPagination } from "deepsea-tools"

import { User } from "@/prisma/generated/client"

import { OidcClientOrderByWithRelationInput } from "@/prisma/generated/internal/prismaNamespace"

import { oidcClientSortBySchema } from "@/schemas/oidcClientSortBy"
import { defaultPageNum } from "@/schemas/pageNum"
import { defaultPageSize } from "@/schemas/pageSize"
import { QueryOidcClientParams } from "@/schemas/queryOidcClient"

import { mapOidcClient, oidcClientTable } from "./oidcClientUtils"

export async function queryOidcClient({
    name = "",
    clientId = "",
    enabled,
    createdBefore,
    createdAfter,
    updatedBefore,
    updatedAfter,
    pageNum = defaultPageNum,
    pageSize = defaultPageSize,
    sortBy = "updatedAt",
    sortOrder = "desc",
}: QueryOidcClientParams) {
    const where = {
        name: name ? { contains: name } : undefined,
        clientId: clientId ? { contains: clientId } : undefined,
        enabled,
        createdAt: {
            gte: createdAfter,
            lte: createdBefore,
        },
        updatedAt: {
            gte: updatedAfter,
            lte: updatedBefore,
        },
    }

    const orderBy: OidcClientOrderByWithRelationInput[] = [
        {
            updatedAt: sortBy === "updatedAt" ? sortOrder : "desc",
        },
    ]

    if (sortBy !== "updatedAt") {
        const validSortBy = oidcClientSortBySchema.safeParse(sortBy)

        if (validSortBy.success) {
            orderBy.unshift({
                [sortBy]: sortOrder,
            })
        }
    }

    const list = await oidcClientTable.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy,
    })

    const total = await oidcClientTable.count({ where })

    return getPagination({
        data: list.map(mapOidcClient),
        total,
        pageNum,
        pageSize,
        exact: true,
    })
}

queryOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
