import { createHash, randomBytes } from "node:crypto"

function base64url(buffer: Buffer) {
    return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export interface PkcePair {
    codeVerifier: string
    codeChallenge: string
    state: string
}

export function createPkcePair(): PkcePair {
    const codeVerifier = base64url(randomBytes(32))
    const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest())
    const state = base64url(randomBytes(16))
    return { codeVerifier, codeChallenge, state }
}
