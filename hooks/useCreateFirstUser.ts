import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"

import { createFirstUserAction } from "@/actions/createFirstUser"

import { User } from "@/prisma/generated/client"

import { CreateFirstUserParams } from "@/schemas/createFirstUser"

export const createFirstUserClient = createRequestFn(createFirstUserAction)

export interface UseCreateFirstUserParams<TContext = never> extends Omit<UseMutationOptions<User, Error, CreateFirstUserParams, TContext>, "mutationFn"> {}

export function useCreateFirstUser<TContext = never>(params: UseCreateFirstUserParams<TContext> = {}) {
    return useMutation<User, Error, CreateFirstUserParams, TContext>({
        mutationFn: createFirstUserClient,
        ...params,
    })
}
