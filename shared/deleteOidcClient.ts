import { prisma } from "@/prisma"

import { DeleteOidcClientParams } from "@/schemas/deleteOidcClient"

import { isAdmin } from "@/server/isAdmin"
import { toOidcClientRecord } from "@/server/oidcClientRecord"

export async function deleteOidcClient({ client_id }: DeleteOidcClientParams) {
    const deleted = await prisma.oidcClient.delete({ where: { client_id } })
    const record = toOidcClientRecord({ client: deleted })
    return record
}

deleteOidcClient.filter = isAdmin
