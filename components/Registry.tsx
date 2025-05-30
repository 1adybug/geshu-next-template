"use client"

import { FC, ReactNode } from "react"
import { AntdRegistry } from "@ant-design/nextjs-registry"
import { HeroUIProvider } from "@heroui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import dayjs from "dayjs"

import "dayjs/locale/zh-cn"

import { MessageInstance } from "antd/es/message/interface"
import useMessage from "antd/es/message/useMessage"

import { IsBrowser } from "@/constants"

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

declare global {
    var message: MessageInstance
}

const Registry: FC<RegistryProps> = props => {
    const { children } = props
    const [message, contextHolder] = useMessage()

    if (IsBrowser) globalThis.message = message

    return (
        <QueryClientProvider client={queryClient}>
            <AntdRegistry hashPriority="high">
                <ConfigProvider locale={zhCN} theme={{ token: { fontFamily: "Source Han Sans VF" } }}>
                    {contextHolder}
                    <HeroUIProvider>{children}</HeroUIProvider>
                </ConfigProvider>
            </AntdRegistry>
        </QueryClientProvider>
    )
}

export default Registry
