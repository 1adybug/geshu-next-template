"use client"

import { ComponentProps, FC } from "react"

import { Button } from "antd"
import { clsx, StrictOmit } from "deepsea-tools"
import { usePathname } from "next/navigation"

import { logoutAction } from "@/actions/logout"

import { useGetUserOwn } from "@/hooks/useGetUserOwn"

import { User } from "@/prisma/generated/client"

import { getPathnameAndSearchParams } from "@/utils/getPathnameAndSearchParams"

import Brand from "./Brand"

interface NavItem {
    href: string
    name: string
    filter?: (user: User) => boolean
}

const navs: NavItem[] = [
    {
        href: "/",
        name: "首页",
    },
    {
        href: "/user-management",
        name: "用户管理",
        filter: user => user.role === "ADMIN",
    },
    {
        href: "/operation-log",
        name: "操作日志",
        filter: user => user.role === "ADMIN",
    },
    {
        href: "/system-log",
        name: "系统日志",
        filter: user => user.role === "ADMIN",
    },
]

export interface HeaderProps extends StrictOmit<ComponentProps<"header">, "children"> {}

const Header: FC<HeaderProps> = ({ className, ...rest }) => {
    const pathname = usePathname()

    const { data } = useGetUserOwn()

    return (
        <header className={clsx("flex h-16 items-center gap-2 px-4", className)} {...rest}>
            <Brand className="flex-none" />
            <div className="flex flex-auto items-center gap-2">
                {navs.map(
                    ({ href, name, filter }) =>
                        (!filter || (!!data && filter(data))) && (
                            <Button
                                key={href}
                                type="link"
                                color={pathname === getPathnameAndSearchParams(href).pathname ? "primary" : undefined}
                                variant="link"
                                href={href}
                            >
                                {name}
                            </Button>
                        ),
                )}
            </div>
            <div className="flex items-center gap-2">
                <div>{data?.username}</div>
                <Button size="small" color="orange" variant="filled" onClick={logoutAction}>
                    注销
                </Button>
            </div>
        </header>
    )
}

export default Header
