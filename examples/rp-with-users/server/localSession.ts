import { tryGetEnv } from "@/server/env"
import { getLocalUserCookie } from "@/server/session"
import { findLinkByLocalUserId, findUserById } from "@/server/storage"

export async function getLocalUser() {
    const cookie = await getLocalUserCookie()
    if (!cookie?.localUserId) return undefined
    const user = await findUserById({ id: cookie.localUserId })
    return user || undefined
}

export interface GetOidcLinkForLocalUserParams {
    localUserId: string
}

export async function getOidcLinkForLocalUser({ localUserId }: GetOidcLinkForLocalUserParams) {
    const env = tryGetEnv()
    if (!env) return undefined
    const link = await findLinkByLocalUserId({ localUserId })
    if (!link) return undefined
    if (link.issuer !== env.MYAPP_OIDC_ISSUER) return undefined
    return link
}
