"use client"

import { FC, ReactNode } from "react"

import { AntdRegistry } from "@ant-design/nextjs-registry"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"

export interface RegistryProps {
    children: ReactNode
}

const Registry: FC<RegistryProps> = ({ children }) => (
    <AntdRegistry hashPriority="high">
        <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
    </AntdRegistry>
)

export default Registry
