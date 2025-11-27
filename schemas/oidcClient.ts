import { z } from "zod/v4"

import { DefaultGrantTypes, DefaultResponseTypes, TokenEndpointAuthMethods } from "@/constants/oidc"

export function splitToList(value?: string | null) {
    if (!value) return []

    return value
        .split(/[\n,]/)
        .flatMap(item => item.split(" "))
        .map(item => item.trim())
        .filter(Boolean)
}

function isValidUrl(value: string) {
    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}

export const redirectUrisSchema = z
    .string({ required_error: "请填写回调地址" })
    .trim()
    .min(1, { message: "请填写回调地址" })
    .refine(value => splitToList(value).length > 0, { message: "至少需要一个回调地址" })
    .refine(value => splitToList(value).every(isValidUrl), { message: "存在无效的回调地址" })

export const uriListSchema = z
    .string()
    .trim()
    .optional()
    .transform(value => value ?? "")

export const grantTypesSchema = z
    .string()
    .trim()
    .optional()
    .transform(value => (value && splitToList(value).length > 0 ? value : DefaultGrantTypes.join(" ")))

export const responseTypesSchema = z
    .string()
    .trim()
    .optional()
    .transform(value => (value && splitToList(value).length > 0 ? value : DefaultResponseTypes.join(" ")))

export const tokenEndpointAuthMethodSchema = z
    .enum(TokenEndpointAuthMethods as unknown as [(typeof TokenEndpointAuthMethods)[number], ...(typeof TokenEndpointAuthMethods)[number][]])
    .optional()
    .transform(value => value ?? "client_secret_basic")

export const scopeSchema = z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform(value => value || undefined)

export const descriptionSchema = z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform(value => value || undefined)
