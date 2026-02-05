import { getSystemConfigSnapshot } from "@/shared/getSystemConfig"

export function getTempEmail(phoneNumber?: string) {
    const { defaultEmailDomain } = getSystemConfigSnapshot()
    return `${crypto.randomUUID()}@${defaultEmailDomain}`
}
