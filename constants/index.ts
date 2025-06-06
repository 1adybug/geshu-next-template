export const IsProduction = process.env.NODE_ENV === "production"

export const IsDevelopment = process.env.NODE_ENV === "development"

export const IsBrowser = typeof window !== "undefined" && typeof window.document !== "undefined"

export const IsServer = !IsBrowser

export const PasswordSalt = process.env.PASSWORD_SALT!

export const PublicApiUrl = process.env.PUBLIC_API_URL!

export const LoginPathname = "/login"

export const CookiePrefix = process.env.COOKIE_PREFIX

export const JWT_SECRET = process.env.JWT_SECRET!
