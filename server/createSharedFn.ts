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
): <TParams extends GetParams<TParam>, TData>(fn: (...args: TParams) => Promise<TData>) => OriginalResponseFn<TParams, TData> {
    function getSharedFn<TParams extends GetParams<TParam>, TData>(fn: (...args: TParams) => Promise<TData>) {
        return defineResponseFnMetadata(fn, params as ResponseFnMetadata<TParams>)
    }

    return getSharedFn
}
