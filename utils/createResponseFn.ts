import { styleText } from "util"
import { Middleware, ResponseData, assignFnName, createFnWithMiddleware } from "deepsea-tools"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { redirect } from "next/navigation"
import { ZodType, z } from "zod"

import { LoginPathname } from "@/constants"

import { User } from "@/prisma/generated"

import { getParser } from "@/schemas"

import { addErrorLog } from "@/server/addErrorLog"
import { addOperationLog } from "@/server/addOperationLog"
import { getCurrentUser } from "@/server/getCurrentUser"

import { ClientError } from "./clientError"

export interface OriginalResponseFn<T, P> {
    (arg: T): Promise<P>
    filter?: boolean | ((user: User) => boolean)
}

export interface ResponseFn<T, P> {
    (arg: T): Promise<ResponseData<P>>
    filter?: boolean | ((user: User) => boolean)
}

const globalResponseFnMiddlewares: Middleware[] = []

export interface CreateResponseFnParams<T extends ZodType<any, any, any>, P> {
    fn: OriginalResponseFn<z.infer<T>, P>
    schema?: T
    name?: string
}

export function createResponseFn<T extends ZodType<any, any, any>, P>({ fn, schema, name }: CreateResponseFnParams<T, P>): ResponseFn<z.infer<T>, P> {
    async function response(arg: z.infer<T>) {
        arg = schema ? getParser(schema)(arg) : arg
        const data = await fn!(arg)
        return {
            success: true,
            data,
            message: undefined,
        }
    }

    assignFnName(response, name ?? fn)

    const newResponse = createFnWithMiddleware(response, {
        global: globalResponseFnMiddlewares,
    })

    assignFnName(newResponse, name ?? fn)

    Object.defineProperty(response, "filter", { value: fn.filter })

    return newResponse
}

createResponseFn.use = function use(middleware: Middleware<OriginalResponseFn<any, any>>) {
    globalResponseFnMiddlewares.push(middleware)
    return createResponseFn
}

createResponseFn.use(async context =>
    addOperationLog({
        action: context.fn.name,
        args: context.arguments,
    }),
)

createResponseFn.use(async (context, next) => {
    try {
        await next()
        if (context.result?.success !== false) return
        addErrorLog({
            action: context.fn.name,
            args: context.arguments,
            error: context.result?.error,
        })
    } catch (e) {
        const error = e as Error
        console.log(styleText("red", error.message))
        console.log(error)
        if (isRedirectError(error)) throw error
        addErrorLog({
            action: context.fn.name,
            args: context.arguments,
            error,
        })
        if (error instanceof ClientError && error.code === 401) redirect(LoginPathname)
        context.result = {
            success: false,
            data: undefined,
            message: error.message,
        }
    }
})

createResponseFn.use(async (context, next) => {
    const user = await getCurrentUser()
    const filter = context.fn.filter ?? true

    if (typeof filter === "function") {
        if (!user) throw new ClientError({ message: "请先登录", code: 401 })
        if (!filter(user)) throw new ClientError({ message: "无权限", code: 403 })
    } else if (filter === true && !user) {
        throw new ClientError({ message: "请先登录", code: 401 })
    }

    await next()
})
