import { NextResponse } from "next/server"

import { prisma } from "@/prisma"

import { getCurrentUser } from "@/server/getCurrentUser"

export const runtime = "nodejs"

function getClientId(params: { client_id?: string }) {
    const clientId = params.client_id?.trim()
    if (!clientId) throw new Error("Invalid client_id")
    return clientId
}

export async function DELETE(_request: Request, { params }: { params: { client_id: string } }) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })

    const client_id = getClientId(params)

    const grants = await prisma.oidcRecord.findMany({
        where: {
            type: "Grant",
            accountId: user.id,
            clientId: client_id,
        },
        select: { id: true },
    })

    const grantIds = grants.map(g => g.id)
    if (grantIds.length === 0) return NextResponse.json({ success: true, data: { success: true } })

    await prisma.oidcRecord.deleteMany({
        where: { grantId: { in: grantIds } },
    })

    await prisma.oidcRecord.deleteMany({
        where: {
            type: "Grant",
            id: { in: grantIds },
        },
    })

    return NextResponse.json({ success: true, data: { success: true } })
}
