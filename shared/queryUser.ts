import { getPagination } from "deepsea-tools"

import { prisma } from "@/prisma"

import { UserOrderByWithRelationInput } from "@/prisma/generated/internal/prismaNamespace"
import { defaultUserSelect } from "@/prisma/getUserSelect"
import { getUserWhere } from "@/prisma/getUserWhere"

import { defaultPageNum } from "@/schemas/pageNum"
import { defaultPageSize } from "@/schemas/pageSize"
import { QueryUserParams } from "@/schemas/queryUser"

export async function queryUser({
    id,
    username = "",
    phone = "",
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    pageNum = defaultPageNum,
    pageSize = defaultPageSize,
    sortBy = "createdAt",
    sortOrder = "asc",
}: QueryUserParams) {
    // phone 需要 trim，因为它没有使用 split
    phone = phone.trim()

    const where = id
        ? { id }
        : getUserWhere({
              phone: phone.length > 0 ? { contains: phone } : undefined,
              createdAt: {
                  gte: createdAfter,
                  lte: createdBefore,
              },
              updatedAt: {
                  gte: updatedAfter,
                  lte: updatedBefore,
              },
              AND: [
                  ...username
                      .split(" ")
                      .filter(Boolean)
                      .map(item => ({
                          username: {
                              contains: item,
                          },
                      })),
              ],
          })

    const orderBy: UserOrderByWithRelationInput[] = [
        {
            createdAt: sortBy === "createdAt" ? sortOrder : "asc",
        },
    ]

    if (sortBy !== "createdAt") {
        if (sortBy === "username" || sortBy === "phone" || sortBy === "role" || sortBy === "updatedAt")
            orderBy.unshift({
                [sortBy]: sortOrder,
            })
    }

    const data = await prisma.user.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        select: defaultUserSelect,
        orderBy,
    })

    const total = await prisma.user.count({ where })

    return getPagination({
        data,
        exact: true,
        total,
        pageNum,
        pageSize,
    })
}
