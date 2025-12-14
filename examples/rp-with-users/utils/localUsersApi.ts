import { callApi } from "@/utils/request"

export interface LocalUserRow {
    id: string
    username: string
    createdAt: string
}

export async function getLocalUsers() {
    return await callApi<LocalUserRow[]>({ url: "/api/local/users", params: { method: "GET" } })
}

export interface CreateLocalUserParams {
    username: string
}

export async function createLocalUser({ username }: CreateLocalUserParams) {
    return await callApi<LocalUserRow>({ url: "/api/local/users", params: { body: { username } } })
}

export interface LoginAsLocalUserParams {
    id: string
}

export async function loginAsLocalUser({ id }: LoginAsLocalUserParams) {
    await callApi<{ success: true }>({ url: "/api/local/login", params: { method: "POST", body: { id } } })
}

export async function logoutLocalUser() {
    window.location.href = "/api/local/logout"
}

export interface BindPendingToLocalUserParams {
    localUserId: string
}

export async function bindPendingToLocalUser({ localUserId }: BindPendingToLocalUserParams) {
    await callApi<{ success: true }>({ url: "/api/local/bind", params: { method: "POST", body: { localUserId } } })
}
