import { requestJson } from "@/utils/request"

export interface TokenSet {
    access_token: string
    refresh_token?: string
    token_type: string
    scope?: string
    expires_in?: number
    expires_at?: number
}

export interface UserInfo {
    sub: string
}

export interface ExchangeCodeForTokensParams {
    issuer: string
    clientId: string
    clientSecret: string
    redirectUri: string
    code: string
    codeVerifier: string
}

export async function exchangeCodeForTokens({ issuer, clientId, clientSecret, redirectUri, code, codeVerifier }: ExchangeCodeForTokensParams) {
    const tokenUrl = `${issuer.replace(/\/$/, "")}/token`

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    })

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            authorization: `Basic ${basic}`,
            accept: "application/json",
        },
        body,
    })

    if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(text || `Token 请求失败(${response.status})`)
    }

    const tokenSet = (await response.json()) as TokenSet
    if (!tokenSet.expires_at && tokenSet.expires_in) tokenSet.expires_at = Math.floor(Date.now() / 1000 + tokenSet.expires_in)
    return tokenSet
}

export interface FetchUserInfoParams {
    issuer: string
    accessToken: string
}

export async function fetchUserInfo({ issuer, accessToken }: FetchUserInfoParams) {
    const userinfoUrl = `${issuer.replace(/\/$/, "")}/me`
    const response = await requestJson<UserInfo>(userinfoUrl, {
        method: "GET",
        headers: {
            authorization: `Bearer ${accessToken}`,
            accept: "application/json",
        },
    })

    if (!response.ok) throw new Error(`UserInfo 请求失败(${response.status})`)
    return response.json
}
