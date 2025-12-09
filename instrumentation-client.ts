import dayjs from "dayjs"
import { createRequestFn, getErrorMessage } from "deepsea-tools"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import "dayjs/locale/zh-cn"

dayjs.locale("zh-cn")

createRequestFn.use(async (context, next) => {
    try {
        await next()
    } catch (error) {
        if (!isRedirectError(error)) {
            console.error(error)
            message.error(getErrorMessage(error))
        }

        throw error
    }
})
