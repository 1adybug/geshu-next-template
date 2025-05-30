import { FC, Fragment, ReactNode } from "react"
import { cookies } from "next/headers"

import { LoginPathname } from "@/constants"

import { getUrl } from "@/server/getUrl"
import { verifyToken } from "@/server/verifyPassword"

import { redirectFromLogin } from "@/utils/redirectFromLogin"
import { redirectToLogin } from "@/utils/redirectToLogin"

export interface AuthProps {
    children?: ReactNode
}

const Auth: FC<AuthProps> = async ({ children }) => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    const url = await getUrl()
    const { pathname } = new URL(url)
    const isLogin = pathname === LoginPathname
    if (!token) {
        if (isLogin) return <Fragment>{children}</Fragment>
        return redirectToLogin(url)
    }
    const auth = await verifyToken(token)
    if (auth && isLogin) return redirectFromLogin(url)
    if (!auth && !isLogin) return redirectToLogin(url)
    return <Fragment>{children}</Fragment>
}

export default Auth
