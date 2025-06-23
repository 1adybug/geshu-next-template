"use client"

import { ComponentProps, FC } from "react"
import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"
import { usePathname } from "next/navigation"
import { StrictOmit } from "soda-type"

import { getUserOwnAction } from "@/actions/getUserOwn"
import { logoutAction } from "@/actions/logout"

import Brand from "./Brand"

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
                <NavbarItem isActive={pathname === "/"}>
                    <Link color={pathname === "/" ? "primary" : "foreground"} href="/">
                        首页
                    </Link>
                </NavbarItem>
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
