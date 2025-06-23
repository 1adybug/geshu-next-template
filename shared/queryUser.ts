import { getPagination } from "deepsea-tools"

import { prisma } from "@/prisma"
import { QueryMode, UserOrderByWithRelationInput } from "@/prisma/generated/internal/prismaNamespace"
import { defaultUserSelect } from "@/prisma/getUserSelect"
import { getUserWhere } from "@/prisma/getUserWhere"

import { QueryUserParams } from "@/schemas/queryUser"

export async function queryUser({
    id,
    username = "",
    phone = "",
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    pageNum = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "asc",
}: QueryUserParams) {
    username = username.trim()
    phone = phone.trim()

    const where = id
        ? { id }
        : getUserWhere({
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

    const orderBy: UserOrderByWithRelationInput[] = [
        {
            createdAt: sortBy === "createdAt" ? sortOrder : "asc",
        },
    ]

    if (sortBy !== "createdAt") {
        if (sortBy === "username" || sortBy === "phone" || sortBy === "role" || sortBy === "updatedAt") {
            orderBy.unshift({
                [sortBy]: sortOrder,
            })
        }
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
        total,
        pageNum,
        pageSize,
    })
}
