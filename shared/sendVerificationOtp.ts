import { auth } from "@/server/auth"

export interface SendVerificationOtpParams {
    phoneNumber: string
}

export async function sendVerificationOtp(params: SendVerificationOtpParams) {
    const data = await auth.api.sendPhoneNumberOTP({
        body: params,
    })

    return data
}

sendVerificationOtp.filter = false
