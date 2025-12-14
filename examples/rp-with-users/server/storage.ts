import { access, mkdir, readFile, writeFile } from "fs/promises"
import { dirname, join } from "path"

import { v4 as uuid } from "uuid"

export interface LocalUser {
    id: string
    username: string
    createdAt: string
}

export interface OidcLink {
    issuer: string
    sub: string
    localUserId: string
    createdAt: string
    updatedAt: string
}

export interface Database {
    users: LocalUser[]
    links: OidcLink[]
}

const DbPath = join(process.cwd(), "data", "db.json")

async function ensureDbFile() {
    await mkdir(dirname(DbPath), { recursive: true })

    try {
        await access(DbPath)
    } catch {
        const initial: Database = { users: [], links: [] }

        await writeFile(DbPath, JSON.stringify(initial, null, 2), "utf-8")
    }
}

async function readDb() {
    await ensureDbFile()
    const json = await readFile(DbPath, "utf-8")
    const data = JSON.parse(json) as Partial<Database>
    return {
        users: Array.isArray(data.users) ? data.users : [],
        links: Array.isArray(data.links) ? data.links : [],
    } satisfies Database
}

async function writeDb(db: Database) {
    await ensureDbFile()
    await writeFile(DbPath, JSON.stringify(db, null, 2), "utf-8")
}

export async function listUsers() {
    const db = await readDb()
    return db.users
}

export interface CreateUserParams {
    username: string
}

export async function createUser({ username }: CreateUserParams) {
    const db = await readDb()

    const user: LocalUser = { id: uuid(), username, createdAt: new Date().toISOString() }

    db.users.unshift(user)
    await writeDb(db)
    return user
}

export interface FindUserByIdParams {
    id: string
}

export async function findUserById({ id }: FindUserByIdParams) {
    const db = await readDb()
    return db.users.find(u => u.id === id)
}

export interface FindLinkParams {
    issuer: string
    sub: string
}

export async function findLink({ issuer, sub }: FindLinkParams) {
    const db = await readDb()
    return db.links.find(l => l.issuer === issuer && l.sub === sub)
}

export interface CreateOrUpdateLinkParams {
    issuer: string
    sub: string
    localUserId: string
}

export async function createOrUpdateLink({ issuer, sub, localUserId }: CreateOrUpdateLinkParams) {
    const db = await readDb()
    const now = new Date().toISOString()
    const existing = db.links.find(l => l.issuer === issuer && l.sub === sub)

    if (existing) {
        existing.localUserId = localUserId
        existing.updatedAt = now
        await writeDb(db)
        return existing
    }

    const link: OidcLink = { issuer, sub, localUserId, createdAt: now, updatedAt: now }

    db.links.unshift(link)
    await writeDb(db)
    return link
}

export interface FindLinkByLocalUserIdParams {
    localUserId: string
}

export async function findLinkByLocalUserId({ localUserId }: FindLinkByLocalUserIdParams) {
    const db = await readDb()
    return db.links.find(l => l.localUserId === localUserId)
}
