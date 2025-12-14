export interface Env {
    MYAPP_OIDC_ISSUER: string
    MYAPP_CLIENT_ID: string
    MYAPP_CLIENT_SECRET: string
    MYAPP_REDIRECT_URI: string
    APP_URL: string
}

function required(name: string) {
    const value = process.env[name]?.trim()
    if (!value) throw new Error(`Missing env ${name}`)
    return value
}

export function getEnv(): Env {
    return {
        MYAPP_OIDC_ISSUER: required("MYAPP_OIDC_ISSUER"),
        MYAPP_CLIENT_ID: required("MYAPP_CLIENT_ID"),
        MYAPP_CLIENT_SECRET: required("MYAPP_CLIENT_SECRET"),
        MYAPP_REDIRECT_URI: required("MYAPP_REDIRECT_URI"),
        APP_URL: required("APP_URL"),
    }
}
