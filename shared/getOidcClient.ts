import { prisma } from "@/prisma"

import { GetOidcClientParams } from "@/schemas/getOidcClient"

import { isAdmin } from "@/server/isAdmin"
import { toOidcClientRecord } from "@/server/oidcClientRecord"

import { ClientError } from "@/utils/clientError"

export async function getOidcClient({ client_id }: GetOidcClientParams) {
    const client = await prisma.oidcClient.findUnique({ where: { client_id } })
    if (!client) throw new ClientError({ message: "未找到该接入方", code: 404 })
    return toOidcClientRecord({ client })
}

getOidcClient.filter = isAdmin
