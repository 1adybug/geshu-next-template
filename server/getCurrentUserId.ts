import { getServerSession } from "next-auth/next"

import { getAuthOptions } from "./authOptions"

export async function getCurrentUserId() {
    const session = await getServerSession(getAuthOptions())
    return (session?.user as unknown as { id?: string } | undefined)?.id
}
