import { PrismaClient } from "./generated/client"

function getPrisma() {
    return new PrismaClient()
}

declare global {
    var __PRISMA__: ReturnType<typeof getPrisma>
}

globalThis.__PRISMA__ ??= getPrisma()

export const prisma = globalThis.__PRISMA__
