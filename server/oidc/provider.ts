import crypto from "crypto" // 引入 Node 内置加密库，用于生成随机密钥/UUID。
import type { IncomingMessage, ServerResponse } from "http" // 引入 HTTP 请求和响应的类型，便于类型标注。

import { exportJWK, generateKeyPair } from "jose" // 引入 jose，用来生成密钥对并导出 JWK。
import Provider, {
    // 引入 oidc-provider 主类和相关类型，确保配置与调用类型安全。
    type Client,
    // OIDC 客户端实例类型。
    type ClientMetadata,
    // 客户端元数据类型，用于静态注册。
    type Configuration,
    // Provider 配置类型。
    type Grant,
    // 授权票据类型，保存 scope/claims。
    type Interaction,
    // 交互上下文类型，记录登录/授权信息。
    type InteractionResults,
    // 交互完成返回的结果结构。
    type JWKS,
    // JSON Web Key Set 类型。
    type KoaContextWithOIDC, // oidc-provider 内部使用的 Koa 上下文类型。,,
} from "oidc-provider"

import { DefaultGrantTypes, DefaultResponseTypes } from "@/constants/oidc" // OIDC 默认授权类型/响应类型。

import { prisma } from "@/prisma" // Prisma 客户端，用于查询用户。

import { OidcClient } from "@/prisma/generated/client"

import { verify } from "@/server/verify" // 校验业务 JWT 的工具，解析出用户 ID。

import { normalizeGrantTypes, normalizeResponseTypes, oidcClientTable, parseList } from "@/shared/oidcClientUtils"

import { getCookieKey } from "@/utils/getCookieKey" // 构造带前缀的 cookie key，统一命名。

import { issuer, selfClientId, selfClientSecret, selfRedirectUri } from "./settings" // 读取 issuer 与自注册客户端配置。

const providerCookieKey = process.env.OIDC_COOKIE_KEY ?? crypto.randomBytes(32).toString("hex") // provider 内部 cookie 签名密钥，若未配置则随机生成。

type InteractionWithChecks = Interaction & {
    // 扩展 Interaction，增加可能缺失的 scope/claims 字段提示。
    missingOIDCScope?: string[] // 缺失的 OIDC scope 列表。
    missingOIDCClaims?: string[] // 缺失的 OIDC claims 列表。
    missingResourceScopes?: Record<string, string[]> // 缺失的资源服务器 scope。
}

function parseCookies(header?: string | null) {
    // 将原始 Cookie 头解析为键值对。
    if (!header) return {} // 如果没有 header，直接返回空对象。

    return Object.fromEntries(
        // 构造键值对象。
        header
            .split(";") // 按分号拆分多个 cookie。
            .map(part => part.trim()) // 去掉两端空白。
            .filter(Boolean) // 过滤空片段。
            .map(part => {
                // 逐个片段处理。
                const [key, ...rest] = part.split("=") // 分离键和值。

                return [decodeURIComponent(key), decodeURIComponent(rest.join("="))] // 还原编码并返回键值对。
            }),
    )
}

async function getAccountIdFromRequest(request: IncomingMessage) {
    // 从请求中解析业务 JWT，返回用户 ID。
    const cookies = parseCookies(request.headers.cookie) // 解析请求头里的 Cookie。

    const token = cookies[getCookieKey("token")] // 取出业务 token。
    return verify(token) // 验证并解析用户 ID。
}

function mapDbClientToMetadata(client: OidcClient): ClientMetadata | undefined {
    const redirectUris = parseList(client.redirectUris)
    if (redirectUris.length === 0) return undefined

    const postLogoutRedirectUris = parseList(client.postLogoutRedirectUris)
    const grantTypes = normalizeGrantTypes(client.grantTypes)
    const responseTypes = normalizeResponseTypes(client.responseTypes)
    const scope = client.scope?.trim() || undefined

    return {
        client_id: client.clientId,
        client_secret: client.clientSecret,
        redirect_uris: redirectUris,
        post_logout_redirect_uris: postLogoutRedirectUris.length > 0 ? postLogoutRedirectUris : undefined,
        grant_types: grantTypes.length > 0 ? grantTypes : [...DefaultGrantTypes],
        response_types: responseTypes.length > 0 ? responseTypes : [...DefaultResponseTypes],
        token_endpoint_auth_method: client.tokenEndpointAuthMethod,
        scope,
    }
}

async function getDatabaseClients(): Promise<ClientMetadata[]> {
    const list = await oidcClientTable.findMany({ where: { enabled: true } })
    return list.map(mapDbClientToMetadata).filter((item): item is ClientMetadata => !!item)
}

function getEnvironmentClients(): ClientMetadata[] {
    // 从环境变量读取额外的 OIDC 客户端配置。
    const raw = process.env.OIDC_CLIENTS?.trim() // 获取环境变量并去掉空白。

    if (!raw) return [] // 未配置则返回空数组。

    try {
        // 尝试解析 JSON。
        const parsed = JSON.parse(raw) // 解析字符串为对象。

        if (!Array.isArray(parsed)) return [] // 如果不是数组则返回空。

        return parsed
            .filter((item): item is ClientMetadata => !!item?.client_id && !!item?.redirect_uris?.length) // 过滤出合法的客户端对象。
            .map(client => ({
                grant_types: client.grant_types ?? [...DefaultGrantTypes],
                response_types: client.response_types ?? [...DefaultResponseTypes],
                token_endpoint_auth_method: client.token_endpoint_auth_method ?? "client_secret_basic",
                ...client,
            }))
    } catch (error) {
        // 捕获解析错误。
        console.warn("[oidc] Failed to parse OIDC_CLIENTS, using defaults instead.", error) // 打印警告，继续使用默认。

        return [] // 返回空列表。
    }
}

async function getAllClients() {
    const databaseClients = await getDatabaseClients()
    const environmentClients = getEnvironmentClients()

    return [
        {
            // 应用自身作为 OAuth 客户端。
            client_id: selfClientId, // 客户端 ID。
            client_secret: selfClientSecret, // 客户端密钥。
            redirect_uris: [selfRedirectUri], // 回调地址列表。
            grant_types: [...DefaultGrantTypes], // 授权类型：授权码与刷新令牌。
            response_types: [...DefaultResponseTypes], // 响应类型：code。
            token_endpoint_auth_method: "client_secret_basic", // 令牌端点认证方式：Basic。
        },
        ...databaseClients,
        ...environmentClients,
    ]
}

async function buildJwks(): Promise<JWKS> {
    // 动态生成 JWKS，用于签名 id_token/access_token。
    const { privateKey } = await generateKeyPair("RS256", { extractable: true }) // 生成 RSA 密钥对，并允许导出。
    const jwk = (await exportJWK(privateKey)) as JWKS["keys"][number] // 将私钥导出为 JWK 格式。
    return { keys: [{ ...jwk, use: "sig", alg: "RS256", kid: crypto.randomUUID() }] } // 构造 JWKS，设置用途/算法/Key ID。
}

async function createProvider() {
    // 创建并配置 oidc-provider 实例。
    const configuration: Configuration = {
        // 定义 provider 配置对象。
        cookies: {
            // 配置 provider 自身的 cookie 签名与安全选项。
            keys: [providerCookieKey], // 设置签名密钥数组。
            long: { signed: true, secure: issuer.startsWith("https://") }, // 长期 cookie 需要签名与安全标志。
            short: { signed: true, secure: issuer.startsWith("https://") }, // 短期 cookie 同样需要签名与安全标志。
        },
        jwks: await buildJwks(), // 设置 JWKS，供 token 签发校验。
        clients: await getAllClients(), // 静态注册的客户端列表（包含数据库 + 环境变量）。
        features: {
            // 开启/关闭特性。
            devInteractions: { enabled: false }, // 关闭默认的开发交互页面，使用自定义流程。
            clientCredentials: { enabled: true }, // 启用客户端凭证模式。
            introspection: { enabled: true }, // 启用 token 自省端点。
            revocation: { enabled: true }, // 启用 token 撤销端点。
            rpInitiatedLogout: { enabled: true }, // 启用 RP 发起的登出。
        },
        pkce: {
            // PKCE 配置。
            required: (_ctx: KoaContextWithOIDC, _client: Client) => true, // 对所有客户端强制要求 PKCE。
        },
        interactions: {
            // 定义交互（登录/授权）处理入口。
            url: (_ctx: KoaContextWithOIDC, interaction: Interaction) => `/api/oidc/interactions/${interaction.uid}`, // 将交互重定向到自定义路由。
        },
        claims: {
            // 声明返回的标准/自定义 claims。
            openid: ["sub"], // openid scope 返回 sub。
            profile: ["username", "role"], // profile scope 返回用户名与角色。
            phone: ["phone"], // phone scope 返回手机号。
        },
        findAccount: async (_ctx: KoaContextWithOIDC, sub: string) => {
            // 通过 sub 查找账户并提供 claims。
            const user = await prisma.user.findUnique({ where: { id: sub } }) // 根据用户 ID 查询数据库。

            if (!user) return undefined // 未找到则返回 undefined。

            return {
                // 返回账户对象。
                accountId: sub, // 账户 ID。
                async claims() {
                    // 定义如何返回 claims。
                    return { sub, username: user.username, phone: user.phone, role: user.role } // 返回所需的用户信息。
                },
            }
        },
        ttl: {
            // 各类 token 的有效期（秒）。
            AccessToken: 60 * 60, // 访问令牌有效期 1 小时。
            AuthorizationCode: 10 * 60, // 授权码有效期 10 分钟。
            IdToken: 60 * 60, // ID 令牌有效期 1 小时。
            RefreshToken: 14 * 24 * 60 * 60, // 刷新令牌有效期 14 天。
        },
    } // 配置结束。

    const provider = new Provider(issuer, configuration) // 基于 issuer 和配置创建 Provider 实例。

    provider.proxy = true // 启用代理模式，信任代理头判断协议/主机。

    provider.on("userinfo.error", (err: unknown) => {
        // 监听 userinfo 错误，便于排障。
        console.error("[oidc] userinfo error", err) // 打印错误信息。
    })

    return provider // 返回初始化好的 provider。
}

let providerPromise: Promise<Provider> | undefined // 缓存 provider 单例的 Promise，避免重复创建。

export function resetOidcProvider() {
    providerPromise = undefined
}

export function getOidcProvider() {
    // 获取（或创建） provider 实例的辅助函数。
    if (!providerPromise) providerPromise = createProvider() // 如果尚未创建，则初始化。

    return providerPromise // 返回 provider Promise。
}

export async function finishInteraction(request: IncomingMessage, response: ServerResponse) {
    // 完成交互：有业务登录态则自动同意并返回。
    const provider = await getOidcProvider() // 获取 provider 实例。
    const details = (await provider.interactionDetails(request, response)) as InteractionWithChecks // 获取当前交互详情，包含缺失的 scope/claims。
    const accountId = await getAccountIdFromRequest(request) // 从业务 JWT 取出用户 ID。

    if (!accountId) return { accountId: undefined, provider, details } // 若未登录，返回信息让上层处理跳转登录。

    let grantId = details.grantId // 读取交互关联的 grantId（可能存在）。
    let grant: Grant | undefined = grantId ? await provider.Grant.find(grantId) : undefined // 若有 grantId，尝试查询已有 grant。

    const clientId = typeof details.params.client_id === "string" ? details.params.client_id : undefined // 提取 client_id，确保类型为字符串。

    if (!clientId) throw new Error("client_id is required for interaction") // 若缺失 client_id，抛出错误终止。

    if (!grant) {
        // 如果没有现成 grant，则新建一个。
        grant = new provider.Grant({
            accountId, // 绑定账户 ID。
            clientId, // 绑定客户端 ID。
        })
    }

    if (details.missingOIDCScope) grant.addOIDCScope(details.missingOIDCScope.join(" ")) // 若缺少 OIDC scope，补全到 grant。

    if (details.missingOIDCClaims) grant.addOIDCClaims(details.missingOIDCClaims) // 若缺少 OIDC claims，补全。

    if (details.missingResourceScopes) {
        // 若缺少资源 scope，则逐个资源添加。
        for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) grant.addResourceScope(indicator, scopes.join(" ")) // 对每个资源添加 scope。
    }

    grantId = grantId ?? (await grant.save()) // 如果是新建 grant，则保存并获取新的 grantId。

    const result: InteractionResults = {
        // 构造交互完成结果。
        login: {
            // 登录结果。
            accountId, // 指定当前账户 ID。
        },
        consent: {
            // 同意结果。
            grantId, // 关联的 grantId，记录授权范围。
        },
    }

    await provider.interactionFinished(request, response, result, { mergeWithLastSubmission: false }) // 通知 provider 交互完成，继续 OIDC 流程。
    return { accountId, provider, details } // 返回关键上下文供调用方使用。
}
