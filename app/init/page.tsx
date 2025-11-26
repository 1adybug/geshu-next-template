"use client"

import { FC } from "react"

import { addToast, Button, Form } from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { createRequestFn } from "deepsea-tools"
import { useRouter } from "next/navigation"
import { FormInput } from "soda-heroui"

import { createFirstUserAction } from "@/actions/createFirstUser"

import Brand from "@/components/Brand"

import { CreateFirstUserParams } from "@/schemas/createFirstUser"
import { phoneSchema } from "@/schemas/phone"
import { usernameSchema } from "@/schemas/username"

import { getOnSubmit } from "@/utils/getOnSubmit"

const mutationFn = createRequestFn(createFirstUserAction)

const Page: FC = () => {
    const router = useRouter()

    const { mutateAsync, isPending } = useMutation({
        mutationFn,
        onSuccess() {
            addToast({
                title: "初始化成功",
                color: "success",
            })

            router.replace("/login")
        },
    })

    const form = useForm({
        defaultValues: {
            username: "",
            phone: "",
        } as CreateFirstUserParams,
        onSubmit({ value }) {
            mutateAsync(value)
        },
    })

    return (
        <main className="grid h-full grid-cols-1 sm:grid-cols-2">
            <div className="relative p-8">
                <Brand />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Form className="w-64" onSubmit={getOnSubmit(form)}>
                        <form.Field name="username" validators={{ onBlur: usernameSchema }}>
                            {field => <FormInput field={field} placeholder="用户名" autoComplete="no" />}
                        </form.Field>
                        <form.Field name="phone" validators={{ onBlur: phoneSchema }}>
                            {field => <FormInput field={field} placeholder="手机号" autoComplete="no" />}
                        </form.Field>
                        <form.Subscribe selector={state => state.values}>
                            {({ username, phone }) => (
                                <Button className="mt-4" color="primary" fullWidth isDisabled={isPending || !username || !phone} type="submit">
                                    初始化
                                </Button>
                            )}
                        </form.Subscribe>
                    </Form>
                </div>
            </div>
            <div className="hidden bg-[url('/login.webp')] bg-cover bg-bottom sm:block" />
        </main>
    )
}

export default Page
