"use client"

import { ComponentProps, FC } from "react"
import { clsx } from "deepsea-tools"
import { StrictOmit } from "soda-type"

export interface HeaderProps extends StrictOmit<ComponentProps<"header">, "children"> {}

const Header: FC<HeaderProps> = ({ className, ...rest }) => {
    return (
        <header className={clsx("h-16", className)} {...rest}>
            header
        </header>
    )
}

export default Header
