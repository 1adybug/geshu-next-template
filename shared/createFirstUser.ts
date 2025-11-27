import { prisma } from "@/prisma"
import { defaultUserSelect } from "@/prisma/getUserSelect"

import { createFirstUserParser } from "@/schemas/createFirstUser"
import { Role } from "@/schemas/role"

import { ClientError } from "@/utils/clientError"

export interface CreateFirstUserParams {
    username: string
    phone: string
}

export async function createFirstUser(params: CreateFirstUserParams) {
    const count = await prisma.user.count()
    if (count > 0) throw new ClientError("禁止操作")
    params = createFirstUserParser(params)
    const user = await prisma.user.create({ data: { ...params, role: Role.管理员 }, select: defaultUserSelect })
    return user
}

createFirstUser.filter = false
