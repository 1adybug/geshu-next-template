import { LoginPathname } from "@/constants"

const DEFAULT_HOST = process.env.PUBLIC_API_URL ?? "http://localhost:3000"

export const issuer = (process.env.OIDC_ISSUER ?? `${DEFAULT_HOST.replace(/\/$/, "")}/api/oidc`).replace(/\/$/, "")

const issuerUrl = new URL(issuer)

export const applicationOrigin = issuerUrl.origin

export const selfClientId = process.env.OIDC_SELF_CLIENT_ID ?? "geshu-next-self"

export const selfClientSecret = process.env.OIDC_SELF_CLIENT_SECRET ?? "geshu-next-self-secret"

export const selfRedirectUri = (process.env.OIDC_SELF_REDIRECT_URI ?? `${applicationOrigin}/api/auth/oidc/callback`).replace(/\/$/, "")

export const loginPathname = process.env.NEXT_PUBLIC_LOGIN_PATHNAME ?? LoginPathname
