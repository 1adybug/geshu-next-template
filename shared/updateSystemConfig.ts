import { SystemConfigId } from "@/constants/systemConfig"

import { prisma } from "@/prisma"

import { SystemConfigParams, systemConfigParser } from "@/schemas/systemConfig"

import { isAdmin } from "@/server/isAdmin"

import { setSystemConfigSnapshot } from "@/shared/getSystemConfig"

export async function updateSystemConfig(params: SystemConfigParams) {
    params = systemConfigParser(params)

    const config = await prisma.systemConfig.upsert({
        where: { id: SystemConfigId },
        create: {
            id: SystemConfigId,
            ...params,
        },
        update: params,
    })

    return setSystemConfigSnapshot(config)
}

updateSystemConfig.filter = isAdmin
