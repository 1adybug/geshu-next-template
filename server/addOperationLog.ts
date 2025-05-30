import { prisma } from "@/prisma"
import { stringifyParams } from "@/utils/stringifyParams"
import { getIp } from "./getIp"
import { getUserAgent } from "./getUserAgent"

export interface AddOperationLogParams {
    action?: string
    args?: unknown
}

export async function addOperationLog({ action, args }: AddOperationLogParams) {
    try {
        const params = stringifyParams(args)
        await prisma.$transaction([
            prisma.operationLog.create({
                data: {
                    action,
                    params,
                    ip: await getIp(),
                    userAgent: await getUserAgent(),
                },
            }),
        ])
    } catch (error) {
        console.error(error)
    }
}
