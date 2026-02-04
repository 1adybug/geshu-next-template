import { LoginEmailPasswordParams, loginEmailPasswordParser } from "@/schemas/loginEmailPassword"

import { auth } from "@/server/auth"
import { createAuthRequest } from "@/server/createAuthRequest"
import { redirectFromLogin } from "@/server/redirectFromLogin"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function loginEmailPassword(params: LoginEmailPasswordParams) {
    params = loginEmailPasswordParser(params)

    const config = await getSystemConfig()

    if (!config.enableEmailPassword) throw new ClientError("未启用邮箱密码登录")

    const { headers, request } = await createAuthRequest({
        method: "POST",
        path: "/sign-in/email",
    })

    await auth.api.signInEmail({
        body: {
            email: params.email.trim().toLowerCase(),
            password: params.password,
        },
        headers,
        request,
    })

    await redirectFromLogin()
}

loginEmailPassword.filter = false
