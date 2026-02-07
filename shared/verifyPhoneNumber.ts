import { auth } from "@/server/auth"

export interface VerifyPhoneNumberParams {
    phoneNumber: string
    code: string
    disableSession?: boolean | undefined
    updatePhoneNumber?: boolean | undefined
}

export async function verifyPhoneNumber(params: VerifyPhoneNumberParams) {
    try {
        const data = await auth.api.verifyPhoneNumber({
            body: {
                ...params,
                disableSession: true,
            },
        })
        return data
    } catch (error) {
        console.log(error)
        throw error
    }
}

verifyPhoneNumber.filter = false
