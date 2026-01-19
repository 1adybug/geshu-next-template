import { randomUUID } from "node:crypto"

import { exportJWK, generateKeyPair } from "jose"

const { privateKey } = await generateKeyPair("RS256", { extractable: true })
const jwk = await exportJWK(privateKey)

const jwks = {
    keys: [
        {
            ...jwk,
            use: "sig",
            alg: "RS256",
            kid: randomUUID(),
        },
    ],
}

process.stdout.write(JSON.stringify(jwks))
