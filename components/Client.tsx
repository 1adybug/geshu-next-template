"use client"

import { FC } from "react"
import { addToast } from "@heroui/react"
import { createRequestFn, getErrorMessage } from "deepsea-tools"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { IsBrowser } from "@/constants"

if (IsBrowser) {
    await import("@ant-design/v5-patch-for-react-19")
    createRequestFn.use(async (context, next) => {
        try {
            await next()
        } catch (error) {
            if (!isRedirectError(error)) {
                console.error(error)
                addToast({
                    title: getErrorMessage(error),
                    color: "danger",
                })
            }
            throw error
        }
    })
}

const Client: FC = () => null

export default Client
