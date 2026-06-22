import type { FC } from "react"

import type { Metadata } from "next"
import Link from "next/link"

import { getCurrentUser } from "@/server/getCurrentUser"

export const metadata: Metadata = {
    title: "首页",
}

const Page: FC = async () => {
    const user = await getCurrentUser()

    return (
        <div>
            <div>Hello, World!</div>
            {user ? (
                <div>{user.nickname}</div>
            ) : (
                <div>
                    <Link href="/login">登录</Link>
                </div>
            )}
        </div>
    )
}

export default Page
