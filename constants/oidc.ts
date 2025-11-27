export const DefaultGrantTypes = ["authorization_code", "refresh_token"] as const

export const DefaultResponseTypes = ["code"] as const

export const TokenEndpointAuthMethods = ["client_secret_basic", "client_secret_post", "none"] as const

export type TokenEndpointAuthMethod = (typeof TokenEndpointAuthMethods)[number]
