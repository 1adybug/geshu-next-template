import { RegisterEmailPasswordParams } from "@/schemas/registerEmailPassword"

import { auth } from "@/server/auth"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function registerEmailPassword({ name, email, password }: RegisterEmailPasswordParams) {
    const { enableEmailPassword, allowRegister } = await getSystemConfig()

    if (!enableEmailPassword) throw new ClientError("未启用邮箱密码登录")
    if (!allowRegister) throw new ClientError("未开放注册")

    const { user } = await auth.api.createUser({
        body: {
            name,
            email,
            password,
            role: "user",
        },
    })

    return user
}

registerEmailPassword.filter = false
