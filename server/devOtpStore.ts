const store = new Map<string, { otp: string; updatedAt: number }>()

export function setDevOtp(key: string, otp: string) {
    store.set(key, { otp, updatedAt: Date.now() })
}

export function getDevOtp(key: string) {
    return store.get(key)?.otp
}

export function clearDevOtp(key: string) {
    store.delete(key)
}
