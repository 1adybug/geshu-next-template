"use client"

import { FC } from "react"
import { createRequestFn, getErrorMessage } from "deepsea-tools"

import { IsBrowser } from "@/constants"

if (IsBrowser) {
    await import("@ant-design/v5-patch-for-react-19")
    createRequestFn.use(async (context, next) => {
        try {
            await next()
        } catch (error) {
            globalThis.message.error(getErrorMessage(error))
            throw error
        }
    })
}

const Client: FC = () => null

export default Client
