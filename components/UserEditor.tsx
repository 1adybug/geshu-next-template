import { type ComponentProps, type FC, useEffect, useRef } from "react"

import { Button, Form, Input, Modal } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { isNonNullable } from "deepsea-tools"
import { schemaToRule } from "soda-antd"

import { useAddUser } from "@/hooks/useAddUser"
import { useGetUser } from "@/hooks/useGetUser"
import { useUpdateUser } from "@/hooks/useUpdateUser"

import type { AddUserParams } from "@/schemas/addUser"
import { nicknameSchema } from "@/schemas/nickname"
import { phoneNumberSchema } from "@/schemas/phoneNumber"
import type { UpdateUserParams } from "@/schemas/updateUser"
import { usernameSchema } from "@/schemas/username"
import { UserRole } from "@/schemas/userRole"

import { RoleSelect } from "./RoleSelect"

const addUserInitialValues: Partial<AddUserParams> = {
    role: UserRole.用户,
}

export interface UserEditorProps extends Omit<ComponentProps<typeof Modal>, "title" | "children" | "keyboard" | "onOk" | "onClose"> {
    id?: string
    onClose?: () => void
}

export const UserEditor: FC<UserEditorProps> = ({
    id,
    open,
    mask = { enabled: true, closable: true, blur: true },
    onClose,
    okButtonProps: { loading: okButtonLoading, ...okButtonProps } = {},
    cancelButtonProps: { disabled: cancelButtonDisabled, ...cancelButtonProps } = {},
    ...rest
}) => {
    const { enabled, blur } = typeof mask === "boolean" ? { enabled: mask, blur: true } : mask
    const isUpdate = isNonNullable(id)
    const [form] = useForm<AddUserParams>()
    const addUserDraft = useRef<Partial<AddUserParams>>({ ...addUserInitialValues })
    const { data, isLoading } = useGetUser(id, { enabled: !!open })

    const { mutateAsync: addUser, isPending: isAddUserPending } = useAddUser({
        onSuccess() {
            addUserDraft.current = { ...addUserInitialValues }
            form.resetFields()
            onClose?.()
        },
    })

    const { mutateAsync: updateUser, isPending: isUpdateUserPending } = useUpdateUser({
        onSuccess() {
            onClose?.()
        },
    })

    useEffect(() => {
        if (!open) return

        form.resetFields()

        if (isUpdate) {
            if (data) form.setFieldsValue(data as AddUserParams)
            return
        }

        form.setFieldsValue({ ...addUserDraft.current })
    }, [data, form, isUpdate, open])

    useEffect(() => {
        if (isNonNullable(id)) return () => form.resetFields()
    }, [id, form])

    const isPending = isAddUserPending || isUpdateUserPending

    const isRequesting = isLoading || isPending

    function onFinish(values: AddUserParams) {
        if (isUpdate) updateUser({ id: id!, ...values } as UpdateUserParams)
        else addUser(values)
    }

    function onValuesChange(_: Partial<AddUserParams>, values: AddUserParams) {
        if (isUpdate) return
        addUserDraft.current = { ...values }
    }

    return (
        <Modal
            title={`${isUpdate ? "修改用户" : "新增用户"}`}
            open={open}
            keyboard={false}
            mask={{ enabled, closable: false, blur }}
            onOk={() => form.submit()}
            okButtonProps={{ loading: isRequesting || okButtonLoading, ...okButtonProps }}
            cancelButtonProps={{ disabled: isPending || cancelButtonDisabled, ...cancelButtonProps }}
            onCancel={() => onClose?.()}
            {...rest}
        >
            <Form<AddUserParams>
                name="user-editor"
                form={form}
                disabled={isRequesting}
                labelCol={{ flex: "56px" }}
                initialValues={addUserInitialValues}
                onFinish={onFinish}
                onValuesChange={onValuesChange}
            >
                <FormItem<AddUserParams> name="name" label="用户名" rules={[schemaToRule(usernameSchema)]}>
                    <Input autoComplete="off" allowClear />
                </FormItem>
                <FormItem<AddUserParams> name="nickname" label="昵称" rules={[schemaToRule(nicknameSchema)]}>
                    <Input autoComplete="off" allowClear />
                </FormItem>
                <FormItem<AddUserParams> name="phoneNumber" label="手机号" rules={[schemaToRule(phoneNumberSchema)]}>
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
