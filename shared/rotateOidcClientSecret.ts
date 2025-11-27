import crypto from "crypto"

import { User } from "@/prisma/generated/client"

import { resetOidcProvider } from "@/server/oidc/provider"

import { ClientError } from "@/utils/clientError"

import { mapOidcClient, oidcClientTable } from "./oidcClientUtils"

export async function rotateOidcClientSecret(id: string) {
    const entity = await oidcClientTable.findUnique({ where: { id } })
    if (!entity) throw new ClientError("客户端不存在")

    const clientSecret = crypto.randomBytes(32).toString("hex")

    const updated = await oidcClientTable.update({
        where: { id },
        data: { clientSecret },
    })

    resetOidcProvider()

    return mapOidcClient(updated)
}

rotateOidcClientSecret.filter = function filter(user: User) {
    return user.role === "ADMIN"
}
