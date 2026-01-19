import { ComponentProps, FC, useEffect } from "react"

import { Button, Form, Input, Modal } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { isNonNullable } from "deepsea-tools"
import { schemaToRule } from "soda-antd"

import { useAddUser } from "@/hooks/useAddUser"
import { useGetUser } from "@/hooks/useGetUser"
import { useUpdateUser } from "@/hooks/useUpdateUser"

import { AddUserParams } from "@/schemas/addUser"
import { phoneSchema } from "@/schemas/phone"
import { UpdateUserParams } from "@/schemas/updateUser"
import { usernameSchema } from "@/schemas/username"

import RoleSelect from "./RoleSelect"

export interface UserEditorProps extends Omit<ComponentProps<typeof Modal>, "title" | "children" | "onOk" | "onClose"> {
    userId?: string
    onClose?: () => void
}

const UserEditor: FC<UserEditorProps> = ({ userId, open, onClose, okButtonProps, cancelButtonProps, ...rest }) => {
    const isUpdate = isNonNullable(userId)
    const [form] = useForm<AddUserParams>()
    const { data, isLoading } = useGetUser({ id: userId, enabled: !!open })

    const { mutateAsync: addUser, isPending: isAddUserPending } = useAddUser({
        onSuccess() {
            onClose?.()
        },
    })

    const { mutateAsync: updateUser, isPending: isUpdateUserPending } = useUpdateUser({
        onSuccess() {
            onClose?.()
        },
    })

    useEffect(() => {
        if (!open || !data) return
        form.setFieldsValue(data as AddUserParams)
    }, [open, data, form])

    useEffect(() => {
        if (isNonNullable(userId)) return () => form.resetFields()
    }, [userId, form])

    const isPending = isAddUserPending || isUpdateUserPending

    const isRequesting = isLoading || isPending

    function onFinish(values: AddUserParams) {
        if (isUpdate) updateUser({ id: userId!, ...values } as UpdateUserParams)
        else addUser(values)
    }

    function onOk() {
        form.submit()
    }

    return (
        <Modal
            open={open}
            title={isUpdate ? "修改用户" : "新增用户"}
            onOk={onOk}
            onCancel={onClose}
            okButtonProps={{ disabled: isRequesting, ...okButtonProps }}
            cancelButtonProps={{ disabled: isRequesting, ...cancelButtonProps }}
            {...rest}
        >
            <Form<AddUserParams> form={form} labelCol={{ flex: "56px" }} onFinish={onFinish}>
                <FormItem<AddUserParams> name="username" label="用户名" rules={[schemaToRule(usernameSchema)]}>
                    <Input autoComplete="off" allowClear />
                </FormItem>
                <FormItem<AddUserParams> name="phone" label="手机号" rules={[schemaToRule(phoneSchema)]}>
                    <Input autoComplete="off" allowClear />
                </FormItem>
                <FormItem<AddUserParams> name="role" label="角色">
                    <RoleSelect />
                </FormItem>
                <FormItem<AddUserParams> noStyle>
                    <Button className="!hidden" htmlType="submit">
                        提交
                    </Button>
                </FormItem>
            </Form>
        </Modal>
    )
}

export default UserEditor
