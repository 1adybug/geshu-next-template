import { FC, ReactNode } from "react"

import { Metadata } from "next"

import Client from "@/components/Client"
import Registry from "@/components/Registry"

import "source-han-sans-sc-vf"

import "./globals.css"

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
    title: "格数科技",
    description: "powered by geshu",
}

export interface RootLayoutProps {
    children?: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => (
    <html lang="zh">
        <body>
            <Client />
            <Registry>{children}</Registry>
        </body>
    </html>
)

export default RootLayout
