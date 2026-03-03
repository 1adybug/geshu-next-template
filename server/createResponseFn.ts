import { styleText } from "node:util"

import { assignFnName, createFnWithMiddleware, Middleware, ResponseData } from "deepsea-tools"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { redirect } from "next/navigation"
import { $ZodType } from "zod/v4/core"

import { LoginPathname } from "@/constants"

import { User } from "@/prisma/generated/client"

import { getParser } from "@/schemas"

import { addErrorLog } from "@/server/addErrorLog"
import { addOperationLog } from "@/server/addOperationLog"
import { FilterConfig } from "@/server/createFilter"
import { checkRateLimit, isGlobalRateLimitEnabled, RateLimitConfig } from "@/server/createRateLimit"
import { getCurrentUser } from "@/server/getCurrentUser"
import { getIp } from "@/server/getIp"

import { ClientError } from "@/utils/clientError"

export interface OriginalResponseFn<TParams extends [arg?: unknown], TData> {
    (...args: TParams): Promise<TData>
    schema?: TParams extends [] ? undefined : $ZodType<TParams[0]>
    filter?: FilterConfig
    rateLimit?: boolean | RateLimitConfig
}

export interface ResponseFn<TParams extends [arg?: unknown], TData> {
    (...args: TParams): Promise<ResponseData<TData>>
    schema?: TParams extends [] ? undefined : $ZodType<TParams[0]>
    filter?: FilterConfig
    rateLimit?: boolean | RateLimitConfig
}

const responseContextUser = Symbol("responseContextUser")

export interface ResponseFnContext {
    [key: string]: unknown
    [responseContextUser]?: Promise<User | undefined>
    error?: unknown
}

export type ResponseMiddleware<TParams extends [arg?: unknown] = [arg?: unknown], TData = unknown> = Middleware<ResponseFn<TParams, TData>, ResponseFnContext>

export interface ResponseFnMetadata<TParams extends [arg?: unknown]> {
    schema?: TParams extends [] ? undefined : $ZodType<TParams[0]>
    filter?: FilterConfig
    rateLimit?: boolean | RateLimitConfig
}

const globalResponseFnMiddlewares: ResponseMiddleware[] = []

function defineResponseFnMetadata<TParams extends [arg?: unknown]>(target: object, metadata: ResponseFnMetadata<TParams>) {
    Object.defineProperty(target, "schema", { value: metadata.schema })
    Object.defineProperty(target, "filter", { value: metadata.filter })
    Object.defineProperty(target, "rateLimit", { value: metadata.rateLimit })
}

async function getCachedCurrentUser(context: ResponseFnContext) {
    if (!context[responseContextUser]) context[responseContextUser] = getCurrentUser()
    return context[responseContextUser]
}

function getResponseError(context: ResponseFnContext, result: ResponseData<unknown>) {
    if (context.error) return context.error
    if (result.message instanceof Error) return result.message
    if (result.message !== undefined) return new Error(String(result.message))

    return new Error("未知错误")
}

const responseErrorMiddleware: ResponseMiddleware = async function responseErrorMiddleware(context, next) {
    try {
        await next()

        if (context.result?.success !== false) return

        void addErrorLog({
            action: context.fn.name,
            args: context.args,
            error: getResponseError(context, context.result),
        })
    } catch (error) {
        if (isRedirectError(error)) throw error

        console.error(styleText("red", error instanceof Error ? error.message : String(error)))
        console.error(error)

        void addErrorLog({
            action: context.fn.name,
            args: context.args,
            error,
        })

        if (error instanceof ClientError && error.code === 401) redirect(LoginPathname)

        context.error = error

        context.result = {
            success: false,
            data: undefined,
            message: error instanceof Error ? error.message : String(error),
        }
    }
}

const operationLogMiddleware: ResponseMiddleware = async function operationLogMiddleware(context, next) {
    await addOperationLog({
        action: context.fn.name,
        args: context.args,
    })

    await next()
}

const filterMiddleware: ResponseMiddleware = async function filterMiddleware(context, next) {
    const user = await getCachedCurrentUser(context)
    const filter = context.fn.filter ?? true

    if (typeof filter === "function") {
        if (!user) throw new ClientError({ message: "请先登录", code: 401 })
        if (!filter(user)) throw new ClientError({ message: "无权限", code: 403 })
    } else if (filter === true && !user) throw new ClientError({ message: "请先登录", code: 401 })

    await next()
}

const rateLimitMiddleware: ResponseMiddleware = async function rateLimitMiddleware(context, next) {
    if (!isGlobalRateLimitEnabled()) {
        await next()
        return
    }

    const rateLimitResult = await checkRateLimit({
        context: {
            action: context.fn.name,
            args: context.args,
            user: await getCachedCurrentUser(context),
            ip: await getIp(),
        },
        rateLimit: context.fn.rateLimit,
    })

    if (rateLimitResult && !rateLimitResult.allowed) {
        throw new ClientError({
            message: rateLimitResult.message,
            code: 429,
        })
    }

    await next()
}

export function createResponseFn<TParams extends [arg?: unknown], TData>(fn: OriginalResponseFn<TParams, TData>): ResponseFn<TParams, TData> {
    const response = async function response(...inputArgs: TParams) {
        let args = inputArgs.slice(0, 1) as TParams
        const schema = fn.schema
        if (args.length > 0 && schema) args = [getParser(schema)(args[0])] as unknown as TParams
        const data = await fn(...args)
        return {
            success: true,
            data,
            message: undefined,
        }
    }

    assignFnName(response, fn.name || fn)
    defineResponseFnMetadata(response, fn)

    const newResponse = createFnWithMiddleware.withContext<ResponseFnContext>()(response, {
        global: globalResponseFnMiddlewares as unknown as ResponseMiddleware<TParams, TData>[],
    })

    assignFnName(newResponse, fn.name || fn)
    defineResponseFnMetadata(newResponse, fn)

    return newResponse
}

createResponseFn.use = function use(middleware: ResponseMiddleware) {
    globalResponseFnMiddlewares.push(middleware)
    return createResponseFn
}

createResponseFn.use(responseErrorMiddleware)
createResponseFn.use(operationLogMiddleware)
createResponseFn.use(filterMiddleware)
createResponseFn.use(rateLimitMiddleware)
