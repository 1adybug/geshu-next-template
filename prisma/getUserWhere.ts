import { DefaultArgs } from "@prisma/client/runtime/library"

import { Prisma } from "./generated"

export function getUserWhere<T extends Prisma.UserFindManyArgs, P extends Prisma.SelectSubset<T, Prisma.UserFindManyArgs<DefaultArgs>>["where"]>(where: P): P {
    return where
}
