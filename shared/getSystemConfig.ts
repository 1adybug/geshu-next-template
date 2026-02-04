import { SystemConfigId } from "@/constants/systemConfig"

import { prisma } from "@/prisma"

import { defaultSystemConfig, SystemConfigParams } from "@/schemas/systemConfig"

const cache = {
    value: defaultSystemConfig,
    updatedAt: 0,
}

const cacheMs = 3000

function normalizeConfig(config?: SystemConfigParams | null) {
    return {
        allowRegister: config?.allowRegister ?? defaultSystemConfig.allowRegister,
        enableEmailPassword: config?.enableEmailPassword ?? defaultSystemConfig.enableEmailPassword,
        enableEmailOtp: config?.enableEmailOtp ?? defaultSystemConfig.enableEmailOtp,
        enablePhonePassword: config?.enablePhonePassword ?? defaultSystemConfig.enablePhonePassword,
        enablePhoneOtp: config?.enablePhoneOtp ?? defaultSystemConfig.enablePhoneOtp,
        defaultEmailDomain: config?.defaultEmailDomain ?? defaultSystemConfig.defaultEmailDomain,
    }
}

export function getSystemConfigSnapshot() {
    return cache.value
}

export function setSystemConfigSnapshot(config: SystemConfigParams) {
    cache.value = normalizeConfig(config)
    cache.updatedAt = Date.now()
    return cache.value
}

export async function getSystemConfig() {
    if (Date.now() - cache.updatedAt < cacheMs) return cache.value

    const config = await prisma.systemConfig.findUnique({
        where: { id: SystemConfigId },
    })

    if (!config) {
        const created = await prisma.systemConfig.create({
            data: {
                id: SystemConfigId,
                ...defaultSystemConfig,
            },
        })

        return setSystemConfigSnapshot(created)
    }

    return setSystemConfigSnapshot(config)
}

getSystemConfig.filter = false
