"use client"

import { ComponentProps, FC } from "react"
import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react"
import { usePathname } from "next/navigation"
import { StrictOmit } from "soda-type"

import { logoutAction } from "@/actions/logout"

import Brand from "./Brand"

export interface HeaderProps extends StrictOmit<ComponentProps<typeof Navbar>, "children"> {}

const Header: FC<HeaderProps> = props => {
    const pathname = usePathname()

    return (
        <Navbar maxWidth="full" {...props}>
            <NavbarBrand className="flex-grow-0 basis-auto">
                <Brand className="flex-none" />
            </NavbarBrand>
            <NavbarContent className="hidden gap-4 sm:flex" justify="start">
                <NavbarItem isActive={pathname === "/user-management"}>
                    <Link color={pathname === "/user-management" ? "primary" : "foreground"} href="/user-management">
                        用户管理
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <div>lurong</div>
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
