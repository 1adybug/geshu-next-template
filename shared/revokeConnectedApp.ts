import { prisma } from "@/prisma"

import { RevokeConnectedAppParams } from "@/schemas/revokeConnectedApp"

import { getCurrentUser } from "@/server/getCurrentUser"

import { ClientError } from "@/utils/clientError"

export async function revokeConnectedApp({ client_id }: RevokeConnectedAppParams) {
    const user = await getCurrentUser()
    if (!user) throw new ClientError({ message: "请先登录", code: 401 })

    const grants = await prisma.oidcRecord.findMany({
        where: {
            type: "Grant",
            accountId: user.id,
            clientId: client_id,
        },
        select: { id: true },
    })

    const grantIds = grants.map(item => item.id)
    if (grantIds.length === 0) return { success: true } as const

    await prisma.oidcRecord.deleteMany({
        where: { grantId: { in: grantIds } },
    })

    await prisma.oidcRecord.deleteMany({
        where: {
            type: "Grant",
            id: { in: grantIds },
        },
    })

    return { success: true } as const
}
