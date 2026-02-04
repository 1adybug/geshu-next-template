import { getSystemConfigSnapshot } from "@/shared/getSystemConfig"

export function getTempEmail() {
    const { defaultEmailDomain } = getSystemConfigSnapshot()
    return `${crypto.randomUUID()}@${defaultEmailDomain}`
}
