"use client"

import { FC, ReactNode } from "react"
import { AntdRegistry } from "@ant-design/nextjs-registry"
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import dayjs from "dayjs"

import "dayjs/locale/zh-cn"

dayjs.locale("zh-cn")

export interface RegistryProps {
    children?: ReactNode
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 0,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        },
    },
})

const Registry: FC<RegistryProps> = props => {
    const { children } = props

    return (
        <QueryClientProvider client={queryClient}>
            <AntdRegistry hashPriority="high">
                <ConfigProvider locale={zhCN} theme={{ token: { fontFamily: "Source Han Sans VF" } }}>
                    <HeroUIProvider locale="zh-CN">
                        <ToastProvider />
                        {children}
                    </HeroUIProvider>
                </ConfigProvider>
            </AntdRegistry>
        </QueryClientProvider>
    )
}

export default Registry
