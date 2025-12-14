import { prisma } from "@/prisma"

function getExpiresAt(expiresIn?: number) {
    if (!expiresIn) return null
    return new Date(Date.now() + expiresIn * 1000)
}

function getString(value: unknown) {
    return typeof value === "string" && value.trim() ? value : null
}

function stringify(value: unknown) {
    return JSON.stringify(value ?? null)
}

function parseJson(value: string) {
    return JSON.parse(value) as unknown
}

function asStringArray(value: unknown, fieldName: string) {
    if (!Array.isArray(value) || value.some(v => typeof v !== "string")) throw new Error(`Invalid OIDC Client field ${fieldName} (must be string[])`)
    return value as string[]
}

class PrismaOidcRecordAdapter {
    constructor(private readonly name: string) {}

    async upsert(id: string, payload: Record<string, unknown>, expiresIn?: number) {
        const expiresAt = getExpiresAt(expiresIn)
        const grantId = typeof payload.grantId === "string" ? payload.grantId : null
        const userCode = typeof payload.userCode === "string" ? payload.userCode : null
        const uid = typeof payload.uid === "string" ? payload.uid : null
        const accountId = getString(payload.accountId)
        const clientId = getString(payload.clientId)

        await prisma.oidcRecord.upsert({
            where: { type_id: { type: this.name, id } },
            create: { type: this.name, id, payload: stringify(payload), expiresAt, grantId, accountId, clientId, userCode, uid },
            update: { payload: stringify(payload), expiresAt, grantId, accountId, clientId, userCode, uid },
        })
    }

    async find(id: string) {
        const record = await prisma.oidcRecord.findUnique({
            where: { type_id: { type: this.name, id } },
        })
        if (!record) return undefined

        if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
            await prisma.oidcRecord.delete({ where: { type_id: { type: this.name, id } } })
            return undefined
        }

        const payload = parseJson(record.payload) as Record<string, unknown>
        if (record.consumedAt && typeof payload.consumed !== "number") payload.consumed = Math.floor(record.consumedAt.getTime() / 1000)
        return payload
    }

    async findByUid(uid: string) {
        const record = await prisma.oidcRecord.findFirst({
            where: { type: this.name, uid },
        })
        if (!record) return undefined

        if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
            await prisma.oidcRecord.delete({ where: { type_id: { type: this.name, id: record.id } } })
            return undefined
        }

        return parseJson(record.payload) as Record<string, unknown>
    }

    async findByUserCode(userCode: string) {
        const record = await prisma.oidcRecord.findFirst({
            where: { type: this.name, userCode },
        })
        if (!record) return undefined

        if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
            await prisma.oidcRecord.delete({ where: { type_id: { type: this.name, id: record.id } } })
            return undefined
        }

        return parseJson(record.payload) as Record<string, unknown>
    }

    async consume(id: string) {
        const existing = await prisma.oidcRecord.findUnique({
            where: { type_id: { type: this.name, id } },
        })
        if (!existing) return

        const consumedAt = new Date()
        const payload = parseJson(existing.payload) as Record<string, unknown>
        payload.consumed = Math.floor(consumedAt.getTime() / 1000)

        await prisma.oidcRecord.update({
            where: { type_id: { type: this.name, id } },
            data: { consumedAt, payload: stringify(payload) },
        })
    }

    async destroy(id: string) {
        await prisma.oidcRecord.delete({ where: { type_id: { type: this.name, id } } }).catch(() => undefined)
    }

    async revokeByGrantId(grantId: string) {
        await prisma.oidcRecord.deleteMany({
            where: { type: this.name, grantId },
        })
    }
}

class PrismaOidcClientAdapter {
    // oidc-provider uses "id" for client_id in its persistence calls.
    async upsert(id: string, payload: Record<string, unknown>) {
        const client_id = id
        const client_secret = typeof payload.client_secret === "string" ? payload.client_secret : ""
        const redirect_uris = asStringArray(payload.redirect_uris, "redirect_uris")
        const grant_types = asStringArray(payload.grant_types, "grant_types")
        const response_types = asStringArray(payload.response_types, "response_types")

        const scope = typeof payload.scope === "string" ? payload.scope : null
        const token_endpoint_auth_method = typeof payload.token_endpoint_auth_method === "string" ? payload.token_endpoint_auth_method : "client_secret_basic"
        const application_type = typeof payload.application_type === "string" ? payload.application_type : "web"
        const client_name = typeof payload.client_name === "string" ? payload.client_name : null
        const is_first_party = typeof payload.is_first_party === "boolean" ? payload.is_first_party : false

        await prisma.oidcClient.upsert({
            where: { client_id },
            create: {
                client_id,
                client_secret,
                redirect_uris: stringify(redirect_uris),
                grant_types: stringify(grant_types),
                response_types: stringify(response_types),
                scope,
                token_endpoint_auth_method,
                application_type,
                client_name,
                is_first_party,
            },
            update: {
                client_secret,
                redirect_uris: stringify(redirect_uris),
                grant_types: stringify(grant_types),
                response_types: stringify(response_types),
                scope,
                token_endpoint_auth_method,
                application_type,
                client_name,
                is_first_party,
            },
        })
    }

    async find(id: string) {
        const client = await prisma.oidcClient.findUnique({ where: { client_id: id } })

        if (!client) return undefined

        return {
            client_id: client.client_id,
            client_secret: client.client_secret,
            redirect_uris: asStringArray(parseJson(client.redirect_uris), "redirect_uris"),
            grant_types: asStringArray(parseJson(client.grant_types), "grant_types"),
            response_types: asStringArray(parseJson(client.response_types), "response_types"),
            scope: client.scope ?? undefined,
            token_endpoint_auth_method: client.token_endpoint_auth_method ?? "client_secret_basic",
            application_type: client.application_type ?? "web",
            client_name: client.client_name ?? undefined,
            is_first_party: client.is_first_party,
        } satisfies Record<string, unknown>
    }

    async destroy(id: string) {
        await prisma.oidcClient.delete({ where: { client_id: id } }).catch(() => undefined)
    }

    async consume(_id: string) {}

    async findByUid(_uid: string) {
        return undefined
    }

    async findByUserCode(_userCode: string) {
        return undefined
    }

    async revokeByGrantId(_grantId: string) {}
}

export function oidcAdapterFactory(name: string) {
    if (name === "Client") return new PrismaOidcClientAdapter()
    return new PrismaOidcRecordAdapter(name)
}
