import { LoginPhonePasswordParams } from "@/schemas/loginPhonePassword"

import { auth } from "@/server/auth"
import { createAuthRequest } from "@/server/createAuthRequest"
import { redirectFromLogin } from "@/server/redirectFromLogin"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function loginPhonePassword(params: LoginPhonePasswordParams) {
    const { enablePhonePassword } = await getSystemConfig()

    if (!enablePhonePassword) throw new ClientError("未启用手机号密码登录")

    const { headers, request } = await createAuthRequest({
        method: "POST",
        path: "/sign-in/phone-number",
    })

    await auth.api.signInPhoneNumber({
        body: params,
        headers,
        request,
    })

    await redirectFromLogin()
}

loginPhonePassword.filter = false
