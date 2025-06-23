import { ComponentProps, FC, Fragment, useEffect } from "react"
import { Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, SelectItem, addToast } from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createRequestFn, isNonNullable, resolveNull } from "deepsea-tools"
import { FormInput, FormSelect, addBetterToast, closeToast } from "soda-heroui"

import { addUserAction } from "@/actions/addUser"
import { getUserAction } from "@/actions/getUser"
import { updateUserAction } from "@/actions/updateUser"

import { AddUserParams, addUserParser } from "@/schemas/addUser"
import { idParser } from "@/schemas/id"
import { phoneSchema } from "@/schemas/phone"
import { Role, RoleNames, roleSchema } from "@/schemas/role"
import { updateUserParser } from "@/schemas/updateUser"
import { usernameSchema } from "@/schemas/username"

import { getOnSubmit } from "@/utils/getOnSubmit"

export interface UserEditorProps extends Omit<ComponentProps<typeof Modal>, "id" | "children"> {
    id?: string
}

const UserEditor: FC<UserEditorProps> = ({ id, isOpen, onClose, ...rest }) => {
    const isUpdate = isNonNullable(id)
    const queryClient = useQueryClient()
    const form = useForm({
        defaultValues: {} as AddUserParams,
        onSubmit({ value }) {
            return mutateAsync(value)
        },
    })

    const { data, isLoading } = useQuery({
        queryKey: ["get-user", id],
        queryFn: isNonNullable(id) ? createRequestFn(() => getUserAction(idParser(id))) : resolveNull,
        enabled: !!isOpen,
    })

    const mutationFn = isUpdate
        ? createRequestFn((data: AddUserParams) => updateUserAction(updateUserParser({ ...data, id })))
        : createRequestFn((data: AddUserParams) => addUserAction(addUserParser(data)))

    const { mutateAsync, isPending } = useMutation({
        mutationFn,
        onMutate() {
            const key = addBetterToast({
                title: `${isUpdate ? "修改用户" : "新增用户"}中...`,
                loading: true,
            })
            return key
        },
        onSuccess() {
            addToast({
                title: `${isUpdate ? "修改用户" : "新增用户"}成功`,
                color: "success",
            })
        },
        onSettled(data, error, variables, context) {
            closeToast(context!)
            queryClient.invalidateQueries({ queryKey: ["query-user"] })
            queryClient.invalidateQueries({ queryKey: ["get-user", id] })
            onClose?.()
        },
    })

    useEffect(() => {
        if (!isOpen || !data) return
        form.reset(data as AddUserParams)
    }, [isOpen, data, form])

    useEffect(() => {
        if (isNonNullable(id)) return () => form.reset()
    }, [id, form])

    const isRequesting = isLoading || isPending

    return (
        <Modal isOpen={isOpen} onClose={onClose} {...rest}>
            <ModalContent>
                {onClose => (
                    <Fragment>
                        <ModalHeader>{isUpdate ? "修改用户" : "新增用户"}</ModalHeader>
                        <ModalBody>
                            <Form onSubmit={getOnSubmit(form)}>
                                <form.Field name="username" validators={{ onBlur: usernameSchema }}>
                                    {field => <FormInput isDisabled={isRequesting} field={field} label="用户名" />}
                                </form.Field>
                                <form.Field name="phone" validators={{ onBlur: phoneSchema }}>
                                    {field => <FormInput isDisabled={isRequesting} field={field} label="手机号" />}
                                </form.Field>
                                <form.Field name="role" validators={{ onBlur: roleSchema }}>
                                    {field => (
                                        <FormSelect isDisabled={isRequesting} field={field} label="角色">
                                            {Object.values(Role).map(role => (
                                                <SelectItem key={role}>{RoleNames[role]}</SelectItem>
                                            ))}
                                        </FormSelect>
                                    )}
                                </form.Field>
                                <Button className="hidden" type="submit" isDisabled={isRequesting}>
                                    确定
                                </Button>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button isDisabled={isRequesting} variant="light" onPress={onClose}>
                                取消
                            </Button>
                            <Button isDisabled={isRequesting} color="primary" onPress={form.handleSubmit}>
                                确定
                            </Button>
                        </ModalFooter>
                    </Fragment>
                )}
            </ModalContent>
        </Modal>
    )
}

export default UserEditor
