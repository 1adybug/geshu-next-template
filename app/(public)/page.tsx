import type { FC } from "react"

import type { Metadata } from "next"
import Link from "next/link"

import Logout from "@/components/Logout"

import { UserRole } from "@/schemas/userRole"

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
                <div>
                    <div>{user.nickname}</div>
                    {user.role === UserRole.管理员 && (
                        <div>
                            <Link href="/admin/user">用户管理</Link>
                        </div>
                    )}
                    <div>
                        <Logout>注销</Logout>
                    </div>
                </div>
            ) : (
                <div>
                    <Link href="/login">登录</Link>
                </div>
            )}
        </div>
    )
}

export default Page
