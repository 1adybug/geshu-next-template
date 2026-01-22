import { createRequestFn, getErrorMessage } from "deepsea-tools"
import { isRedirectError } from "next/dist/client/components/redirect-error"

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
