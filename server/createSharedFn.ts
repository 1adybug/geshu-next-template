import { IsNever } from "deepsea-tools"
import { $ZodType } from "zod/v4/core"

import { FilterConfig } from "./createFilter"
import { RateLimitConfig } from "./createRateLimit"
import { defineResponseFnMetadata, OriginalResponseFn, ResponseFnMetadata, RouteBodyType } from "./createResponseFn"

export interface CreateSharedFnParams<TParam> {
    name: string
    schema?: $ZodType<TParam>
    filter?: FilterConfig
    rateLimit?: boolean | RateLimitConfig
    bodyType?: RouteBodyType
}

type GetParams<TParam> = IsNever<TParam> extends true ? [] : [TParam]

export function createSharedFn<TParam>(
    params: CreateSharedFnParams<TParam>,
): <TData>(fn: (...args: GetParams<TParam>) => Promise<TData>) => OriginalResponseFn<GetParams<TParam>, TData> {
    function getSharedFn<TData>(fn: (...args: GetParams<TParam>) => Promise<TData>) {
        return defineResponseFnMetadata(fn, params as ResponseFnMetadata<GetParams<TParam>>)
    }

    return getSharedFn
}
