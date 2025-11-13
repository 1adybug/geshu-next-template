/* eslint-disable */

import { isJSONArray, isJSONObject } from "es-toolkit"
import { PublicApiUrl } from "@/constants"

export interface ResponseData<T = any> {
    json: T
    blob: Blob
    text: string
    arrayBuffer: ArrayBuffer
    formData: FormData
    stream: Response
}

export type ResponseType = keyof ResponseData

export interface RequestOptions<T extends ResponseType = "json"> extends Omit<RequestInit, "body" | "method"> {
    method?: "GET" | "POST" | "DELETE" | "HEAD" | "OPTIONS" | "PUT" | "PATCH" | "CONNECT" | "TRACE" | (string & {})
    /**
     * 响应的数据类型，默认 json
     * @default "json"
     */
    type?: T
    base?: string | URL
    body?: BodyInit | Record<string, any> | any[]
    search?: (string | number | boolean)[][] | Record<string, string | number | boolean> | string | URLSearchParams
}

export async function request<T extends any = any, P extends ResponseType = "json">(
    input: string | URL,
    options?: RequestOptions<P>,
): Promise<ResponseData<T>[P]> {
    let { headers, type = "json", body, base, search = {}, method = "POST", ...rest } = options ?? {}
    const url = new URL(input, typeof input === "string" ? (base ?? PublicApiUrl) : undefined)

    if (isJSONArray(search)) search = search.map(item => item.map(i => String(i)))
    if (isJSONObject(search)) search = Object.entries(search).map(([key, value]) => [key, String(value)])

    if (url.search) url.search = `${url.search}&${search.toString()}`
    else url.search = search.toString()

    if (type !== "json" && type !== "blob" && type !== "text" && type !== "arrayBuffer" && type !== "formData" && type !== "stream")
        throw new Error(`Invalid response type: ${type}`)

    headers = new Headers(headers)

    if (body && (isJSONObject(body) || isJSONArray(body))) {
        headers.set("Content-Type", "application/json")
        method ??= "POST"
        body = JSON.stringify(body)
    }

    const response = await fetch(url, { headers, body, method, ...rest } as RequestInit)

    switch (type) {
        case "json":
            const json = await response.json()
            if (!json.success) throw new Error(json.message)
            return json.data
        case "blob":
            return (await response.blob()) as any
        case "text":
            return (await response.text()) as any
        case "arrayBuffer":
            return (await response.arrayBuffer()) as any
        case "formData":
            return (await response.formData()) as any
        case "stream":
            return response as any
    }
}
