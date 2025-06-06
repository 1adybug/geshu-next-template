import { prisma } from "@/prisma"

import { ClientError } from "@/utils/clientError"
import { stringifyParams } from "@/utils/stringifyParams"

import { getIp } from "./getIp"
import { getUserAgent } from "./getUserAgent"
import { getUserId } from "./getUserId"

function getConstructorName(obj: unknown): string {
    if (obj === undefined || obj === null) return "unknown"
    return obj.constructor.name
}

function getStringProperty(obj: unknown, key: string): string | undefined {
    return ((obj ?? {}) as any)[key]
}

export interface AddErrorLogParams {
    error: unknown
    action?: string
    args?: unknown
}

export async function addErrorLog({ error, action, args }: AddErrorLogParams) {
    try {
        const userId = await getUserId()
        const params = stringifyParams(args)
        await prisma.$transaction([
            prisma.errorLog.create({
                data: {
                    type: getConstructorName(error),
                    message: getStringProperty(error, "message") ?? String(error),
                    stack: getStringProperty(error, "stack"),
                    action,
                    params,
                    ip: await getIp(),
                    userAgent: await getUserAgent(),
                    userId,
                },
            }),
        ])
        if (error instanceof ClientError && error.origin) {
            await addErrorLog({
                error: error.origin,
                action,
                args,
            })
        }
    } catch (error) {
        console.error(error)
    }
}
