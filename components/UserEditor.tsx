import { ComponentProps, FC, useEffect } from "react"

import { useMutation } from "@tanstack/react-query"
import { Form, Input, Modal, Select } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { getEnumOptions, isNonNullable } from "deepsea-tools"
import { aclsm } from "soda-antd"

import { addUserClient } from "@/hooks/useAddUser"
import { useGetUser } from "@/hooks/useGetUser"
import { updateUserClient } from "@/hooks/useUpdateUser"

import { AddUserParams } from "@/schemas/addUser"
import { Role } from "@/schemas/role"
import { UpdateUserParams } from "@/schemas/updateUser"

import { uuid } from "@/utils/uuid"

export interface UserEditorProps extends Omit<ComponentProps<typeof Modal>, "title" | "children" | "onOk" | "onClose"> {
    userId?: string
    onClose?: () => void
}

const UserEditor: FC<UserEditorProps> = ({ classNames, userId, open, onClose, okButtonProps, cancelButtonProps, ...rest }) => {
    const isUpdate = isNonNullable(userId)
    const [form] = useForm<AddUserParams>()
    const action = isUpdate ? "修改用户" : "新增用户"
    const { data, isLoading } = useGetUser({ id: userId, enabled: !!open })

    const { mutateAsync, isPending } = useMutation({
        mutationFn: isUpdate ? updateUserClient : addUserClient,
        onMutate() {
            const key = uuid()

            message.loading({
                key,
                content: `${action}中`,
                duration: 0,
            })

            return key
        },
        onSuccess() {
            message.success(`${action}成功`)
        },
        onError() {
            message.error(`${action}失败`)
        },
        onSettled(data, error, variables, onMutateResult, context) {
            onClose?.()
            message.destroy(onMutateResult!)
            context.client.invalidateQueries({ queryKey: ["query-user"] })
            context.client.invalidateQueries({ queryKey: ["get-user", userId] })
        },
    })

    useEffect(() => {
        if (!open || !data) return
        form.setFieldsValue(data as AddUserParams)
    }, [open, data, form])

    useEffect(() => {
        if (isNonNullable(userId)) return () => form.resetFields()
    }, [userId, form])

    const isRequesting = isLoading || isPending

    function onFinish(values: AddUserParams) {
        mutateAsync({ id: userId, ...values } as UpdateUserParams)
    }

    function onOk() {
        form.submit()
    }

    return (
        <Modal
            classNames={aclsm({ body: "!pt-2" }, classNames)}
            open={open}
            title={isUpdate ? "修改用户" : "新增用户"}
            onOk={onOk}
            onCancel={onClose}
            okButtonProps={{ disabled: isRequesting, ...okButtonProps }}
            cancelButtonProps={{ disabled: isRequesting, ...cancelButtonProps }}
            {...rest}
        >
            <Form<AddUserParams> form={form} labelCol={{ flex: "56px" }} onFinish={onFinish}>
                <FormItem<AddUserParams> name="username" label="用户名">
                    <Input autoComplete="off" allowClear />
                </FormItem>
                <FormItem<AddUserParams> name="phone" label="手机号">
                    <Input autoComplete="off" allowClear />
                </FormItem>
                <FormItem<AddUserParams> name="role" label="角色">
                    <Select options={getEnumOptions(Role)} />
                </FormItem>
            </Form>
        </Modal>
    )
}

export default UserEditor
