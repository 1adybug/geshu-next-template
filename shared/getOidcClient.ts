import { prisma } from "@/prisma"

import { User } from "@/prisma/generated/client"

import { GetOidcClientParams } from "@/schemas/getOidcClient"

import { toOidcClientRecord } from "@/server/oidcClientRecord"

import { ClientError } from "@/utils/clientError"

export async function getOidcClient({ client_id }: GetOidcClientParams) {
    const client = await prisma.oidcClient.findUnique({ where: { client_id } })
    if (!client) throw new ClientError({ message: "未找到该接入方", code: 404 })
    return toOidcClientRecord({ client })
}

getOidcClient.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
