import type { FC, ReactNode } from "react"

import { Brand } from "@/components/Brand"

export interface StartupLayoutProps {
    children?: ReactNode
}

export const StartupLayout: FC<StartupLayoutProps> = ({ children }) => (
    <main className="grid h-full grid-cols-1 sm:grid-cols-2">
        <div className="relative p-8">
            <Brand />
            <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-4">{children}</div>
        </div>
        <div className="hidden bg-[url('/login.webp')] bg-cover bg-bottom sm:block" />
    </main>
)
