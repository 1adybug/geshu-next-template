"use client"

import { ComponentProps, FC } from "react"

import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"
import { usePathname } from "next/navigation"
import { StrictOmit } from "soda-type"

import { getUserOwnAction } from "@/actions/getUserOwn"
import { logoutAction } from "@/actions/logout"

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

export interface HeaderProps extends StrictOmit<ComponentProps<typeof Navbar>, "children"> {}

const Header: FC<HeaderProps> = props => {
    const pathname = usePathname()

    const { data } = useQuery({
        queryKey: ["get-user-own"],
        queryFn: createRequestFn(getUserOwnAction),
    })

    return (
        <Navbar maxWidth="full" {...props}>
            <NavbarBrand className="flex-grow-0 basis-auto">
                <Brand className="flex-none" />
            </NavbarBrand>
            <NavbarContent className="hidden gap-4 sm:flex" justify="start">
                {navs.map(
                    ({ href, name, filter }) =>
                        (!filter || (!!data && filter(data))) && (
                            <NavbarItem key={href} isActive={pathname === getPathnameAndSearchParams(href).pathname}>
                                <Link color={pathname === getPathnameAndSearchParams(href).pathname ? "primary" : "foreground"} href={href}>
                                    {name}
                                </Link>
                            </NavbarItem>
                        ),
                )}
            </NavbarContent>
            <NavbarContent justify="end">
                <div>{data?.username}</div>
                <NavbarItem>
                    <Button as={Link} color="warning" href="#" variant="flat" onPress={logoutAction} size="sm">
                        注销
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
}

export default Header
