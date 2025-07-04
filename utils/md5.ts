import { createHash } from "crypto"

export function md5(str: string) {
    const hash = createHash("md5")
    hash.update(str)
    return hash.digest("hex")
}
