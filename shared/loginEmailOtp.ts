import { LoginEmailOtpParams } from "@/schemas/loginEmailOtp"

import { auth } from "@/server/auth"
import { createAuthRequest } from "@/server/createAuthRequest"
import { redirectFromLogin } from "@/server/redirectFromLogin"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function loginEmailOtp(params: LoginEmailOtpParams) {
    const { enableEmailOtp } = await getSystemConfig()

    if (!enableEmailOtp) throw new ClientError("未启用邮箱验证码登录")

    const { headers, request } = await createAuthRequest({
        method: "POST",
        path: "/sign-in/email-otp",
    })

    await auth.api.signInEmailOTP({
        body: params,
        headers,
        request,
    })

    await redirectFromLogin()
}

loginEmailOtp.filter = false
