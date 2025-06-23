import { DefaultArgs } from "@prisma/client/runtime/library"

import { Prisma } from "./generated"

export function getUserSelect<T extends Prisma.UserFindManyArgs, P extends Prisma.SelectSubset<T, Prisma.UserFindManyArgs<DefaultArgs>>["select"]>(
    select: P,
): P {
    return select
}

export const defaultUserSelect = getUserSelect({
    id: true,
    createdAt: true,
    updatedAt: true,
    username: true,
    phone: true,
    role: true,
})
