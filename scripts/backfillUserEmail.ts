import { prisma } from "@/prisma"

import { getTempEmail } from "@/server/getTempEmail"

import { getSystemConfig } from "@/shared/getSystemConfig"

async function main() {
    const config = await getSystemConfig()
    const domain = config.defaultEmailDomain?.trim() || "geshu.ai"

    const users = await prisma.user.findMany({
        where: {
            OR: [{ email: "" }],
        },
    })

    for (const user of users) {
        const email = getTempEmail({ seed: user.id }).replace(/@.*$/, `@${domain}`)
        const name = user.name?.trim() || user.username?.trim() || email

        await prisma.user.update({
            where: { id: user.id },
            data: {
                email,
                name,
            },
        })
    }
}

main()
    .catch(error => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
