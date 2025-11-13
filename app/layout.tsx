import { FC, ReactNode } from "react"

import { Metadata } from "next"

import Client from "@/components/Client"
import Registry from "@/components/Registry"

import "./globals.css"

export const metadata: Metadata = {
    title: "格数科技",
    description: "powered by geshu",
}

export interface RootLayoutProps {
    children?: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="zh">
            <body>
                <Client />
                <Registry>{children}</Registry>
            </body>
        </html>
    )
}

export default RootLayout
