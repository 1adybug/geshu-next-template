import { NextResponse } from "next/server"

import { prisma } from "@/prisma"

import { getCurrentUser } from "@/server/getCurrentUser"

export const runtime = "nodejs"

function getClientIdFromRequest(request: Request) {
    const url = new URL(request.url)
    const last = url.pathname.split("/").filter(Boolean).pop()
    const decoded = last ? decodeURIComponent(last).trim() : ""
    return decoded || undefined
}

export async function DELETE(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ success: false, message: "萩枠鞠村" }, { status: 401 })

        const client_id = getClientIdFromRequest(request)
        if (!client_id) return NextResponse.json({ success: false, message: "Invalid client_id" }, { status: 400 })

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
    } catch (error) {
        const message = error instanceof Error ? error.message : "撤销授权失败"
        return NextResponse.json({ success: false, message }, { status: 500 })
    }
}
