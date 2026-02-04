import { auth } from "@/server/auth"
import { createAuthRequest } from "@/server/createAuthRequest"

export async function getCurrentUserId() {
    try {
        const { headers, request } = await createAuthRequest({
            method: "GET",
            path: "/get-session",
        })

        const session = await auth.api.getSession({
            headers,
            request,
        })

        return session?.user?.id
    } catch (error) {
        return undefined
    }
}
