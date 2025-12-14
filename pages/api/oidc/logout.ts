import type { NextApiRequest, NextApiResponse } from "next"

function getReturnTo(request: NextApiRequest) {
    const returnTo = request.query.returnTo
    if (typeof returnTo !== "string" || !returnTo.trim()) return "/login"
    return returnTo
}

function clearCookie(name: string) {
    return `${name}=; Path=/api/oidc; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method !== "GET") return response.status(405).end()

    response.setHeader("Set-Cookie", [clearCookie("_oidc_session"), clearCookie("_oidc_session.sig")])

    return response.redirect(302, getReturnTo(request))
}
