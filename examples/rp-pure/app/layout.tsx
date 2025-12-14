import type { ReactNode } from "react"

import Registry from "@/components/Registry"

import "./globals.css"

export interface RootLayoutProps {
    children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="zh">
            <body>
                <Registry>{children}</Registry>
            </body>
        </html>
    )
}
