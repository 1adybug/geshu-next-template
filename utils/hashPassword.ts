import { PasswordSalt } from "@/constants"

import { md5 } from "@/utils/md5"

export function hashPassword(password: string) {
    return md5(md5(password) + PasswordSalt)
}
