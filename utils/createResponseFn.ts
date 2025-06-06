import { Middleware, ResponseData, assignFnName, createFnWithMiddleware } from "deepsea-tools"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { LoginPathname } from "@/constants"

import { getParser } from "@/schemas"

import { addErrorLog } from "@/server/addErrorLog"
import { addOperationLog } from "@/server/addOperationLog"
import { verifyToken } from "@/server/verifyPassword"

import { ClientError } from "./clientError"

export interface OriginalResponseFn<T, P> {
    (arg: T): Promise<P>
    isAuthExempt?: boolean
}

export interface ResponseFn<T, P> {
    (arg: T): Promise<ResponseData<P>>
    isAuthExempt?: boolean
}

const globalResponseFnMiddlewares: Middleware[] = []

export function createResponseFn<T, P>(fn: OriginalResponseFn<T, P>): ResponseFn<T, P>
export function createResponseFn<T, P>(schema: z.ZodType<T>, fn: OriginalResponseFn<T, P>): ResponseFn<T, P>
export function createResponseFn<T, P>(schemaOrFn: z.ZodType<T> | OriginalResponseFn<T, P>, fn?: OriginalResponseFn<T, P>): ResponseFn<T, P> {
    const params = typeof fn === "function" ? { schema: schemaOrFn as z.ZodType<T>, fn } : { schema: undefined, fn: schemaOrFn as OriginalResponseFn<T, P> }
    const schema = params.schema
    fn = params.fn

    async function response(arg: T) {
        arg = schema ? getParser(schema)(arg) : arg
        const data = await fn!(arg)
        return {
            success: true,
            data,
            message: undefined,
        }
    }

    assignFnName(response, fn)

    const newResponse = createFnWithMiddleware(response, {
        global: globalResponseFnMiddlewares,
    })

    assignFnName(newResponse, fn)

    Object.defineProperty(response, "isAuthExempt", { value: fn.isAuthExempt })

    return newResponse
}

createResponseFn.use = function use(middleware: Middleware<OriginalResponseFn<any, any>>) {
    globalResponseFnMiddlewares.push(middleware)
    return createResponseFn
}

createResponseFn.use(async context =>
    addOperationLog({
        action: context.fn.name,
        args: context.args,
    }),
)

createResponseFn.use(async (context, next) => {
    try {
        await next()
        if (context.result?.success !== false) return
        addErrorLog({
            action: context.fn.name,
            args: context.args,
            error: context.result?.error,
        })
    } catch (error) {
        console.log((error as Error).message)
        if (isRedirectError(error)) throw error
        addErrorLog({
            action: context.fn.name,
            args: context.args,
            error,
        })
        if (error instanceof ClientError && error.code === 401) redirect(LoginPathname)
        context.result = {
            success: false,
            data: undefined,
            message: error instanceof ClientError ? error.message : "服务器错误",
        }
    }
})

createResponseFn.use(async (context, next) => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!context.fn.isAuthExempt && !token)
        throw new ClientError({
            message: "请先登录",
            code: 401,
        })

    if (!context.fn.isAuthExempt && !(await verifyToken(token)))
        throw new ClientError({
            message: "身份验证失败",
            code: 401,
        })

    await next()
})
