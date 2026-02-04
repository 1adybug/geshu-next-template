import { RegisterPhoneOtpParams } from "@/schemas/registerPhoneOtp"

import { auth } from "@/server/auth"
import { createAuthRequest } from "@/server/createAuthRequest"
import { redirectFromLogin } from "@/server/redirectFromLogin"

import { getSystemConfig } from "@/shared/getSystemConfig"

import { ClientError } from "@/utils/clientError"

export async function registerPhoneOtp(params: RegisterPhoneOtpParams) {
    const { enablePhoneOtp, allowRegister } = await getSystemConfig()

    if (!enablePhoneOtp) throw new ClientError("未启用手机号验证码登录")
    if (!allowRegister) throw new ClientError("未开放注册")

    const { headers, request } = await createAuthRequest({
        method: "POST",
        path: "/phone-number/verify",
    })

    await auth.api.verifyPhoneNumber({
        body: params,
        headers,
        request,
    })

    await redirectFromLogin()
}

registerPhoneOtp.filter = false
