export interface RequestJsonResult<T> {
    ok: boolean
    status: number
    json: T
}

export interface RequestParams extends Omit<RequestInit, "body"> {
    body?: BodyInit | Record<string, unknown>
}

export async function requestJson<T>(url: string, params: RequestParams = {}) {
    const { body, headers, ...rest } = params
    const nextHeaders = new Headers(headers)

    let nextBody: BodyInit | undefined = body as BodyInit | undefined

    if (
        body &&
        typeof body === "object" &&
        !(body instanceof ArrayBuffer) &&
        !(body instanceof Blob) &&
        !(body instanceof FormData) &&
        !(body instanceof URLSearchParams)
    ) {
        nextHeaders.set("content-type", "application/json")
        nextBody = JSON.stringify(body)
    }

    const response = await fetch(url, { ...rest, headers: nextHeaders, body: nextBody })
    const json = (await response.json().catch(() => undefined)) as T
    return { ok: response.ok, status: response.status, json } satisfies RequestJsonResult<T>
}

export interface CallApiParams {
    url: string
    params?: RequestParams
}

export async function callApi<T>({ url, params }: CallApiParams) {
    const result = await requestJson<{ success: boolean; data?: T; message?: string }>(url, params)
    if (!result.ok || !result.json?.success) throw new Error(result.json?.message || `请求失败(${result.status})`)
    return result.json.data as T
}
