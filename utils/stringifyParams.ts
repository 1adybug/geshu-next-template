export function stringifyParams(params: unknown): string | undefined {
    let result: string | undefined
    try {
        if (Array.isArray(params) && params.length === 1) result = JSON.stringify(params[0])
        else result = JSON.stringify(params)
    } catch (error) {}
    return result
}
