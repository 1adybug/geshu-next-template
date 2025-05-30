import { FC, ReactNode } from "react"

import Auth from "@/components/Auth"

export interface LayoutProps {
    children?: ReactNode
}

const Layout: FC<LayoutProps> = props => {
    const { children } = props

    return <Auth>{children}</Auth>
}

export default Layout
