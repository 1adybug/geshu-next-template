export function getOidcJwks() {
    const raw = process.env.OIDC_JWKS?.trim()
    if (!raw) throw new Error("Missing env OIDC_JWKS (JSON JWKS with private signing keys)")

    let parsed: unknown

    try {
        parsed = JSON.parse(raw)
    } catch {
        throw new Error("Invalid env OIDC_JWKS (must be valid JSON)")
    }

    if (!parsed || typeof parsed !== "object") throw new Error("Invalid env OIDC_JWKS (must be an object)")

    return parsed as Record<string, unknown>
}
