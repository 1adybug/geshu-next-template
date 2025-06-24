import { DefaultArgs } from "@prisma/client/runtime/library"

import { Prisma } from "./generated"

export function getOperationLogWhere<
    T extends Prisma.OperationLogFindManyArgs,
    P extends Prisma.SelectSubset<T, Prisma.OperationLogFindManyArgs<DefaultArgs>>["where"],
>(where: P): P {
    return where
}
