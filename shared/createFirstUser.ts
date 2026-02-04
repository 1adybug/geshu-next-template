import { prisma } from "@/prisma"

import { CreateFirstUserParams } from "@/schemas/createFirstUser"

import { auth } from "@/server/auth"

import { ClientError } from "@/utils/clientError"

export async function createFirstUser({ email, name, phoneNumber, password }: CreateFirstUserParams) {
    const count = await prisma.user.count()
    if (count > 0) throw new ClientError("禁止操作")

    const { user } = await auth.api.createUser({
        body: {
            name,
            email,
            password,
            role: "admin",
            data: {
                phoneNumber,
            },
        },
    })

    if (!user) throw new ClientError("初始化失败")

    return user
}

createFirstUser.filter = false
