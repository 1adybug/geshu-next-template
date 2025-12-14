import { ComponentProps, FC, useEffect } from "react"

import { Button, Form, Input, Modal, Select, Switch } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { isNonNullable } from "deepsea-tools"

import { useCreateOidcClient, useGetOidcClient, useUpdateOidcClient } from "@/hooks/useOidcClients"

import { OidcClientParams } from "@/schemas/oidcClient"

import { uuid } from "@/utils/uuid"

type FormValues = Omit<OidcClientParams, "grant_types" | "response_types"> & {
    grant_types?: string[]
    response_types?: string[]
}

export interface OidcClientEditorProps extends Omit<ComponentProps<typeof Modal>, "title" | "children" | "onOk" | "onCancel" | "confirmLoading" | "okText"> {
    clientId?: string
    onClose?: () => void
}

const knownGrantTypes = ["authorization_code", "refresh_token", "client_credentials", "implicit"]

const knownResponseTypes = ["code", "id_token", "code id_token"]

const OidcClientEditor: FC<OidcClientEditorProps> = ({ clientId, open, onClose, ...rest }) => {
    const isUpdate = isNonNullable(clientId)
    const [form] = useForm<FormValues>()

    const { data, isLoading } = useGetOidcClient({ client_id: clientId, enabled: !!open && isUpdate })

    const { mutateAsync: createAsync, isPending: isCreatePending } = useCreateOidcClient({
        onMutate() {
            const key = uuid()
            message.loading({ key, content: "正在创建", duration: 0 })
            return key
        },
        onSuccess(d) {
            message.success("创建成功")

            if (d.client_secret) {
                Modal.info({
                    title: "Client Secret（请妥善保存）",
                    content: (
                        <div className="break-all">
                            <div className="text-xs text-neutral-500">后续列表页会对 secret 打码显示，如需再次查看请进入编辑页。</div>
                            <div className="mt-2 font-mono">{d.client_secret}</div>
                        </div>
                    ),
                })
            }
        },
        onError(e) {
            message.error(e.message || "创建失败")
        },
        onSettled(_data, _error, _variables, key) {
            if (key) message.destroy(key)
        },
    })

    const { mutateAsync: updateAsync, isPending: isUpdatePending } = useUpdateOidcClient({
        onMutate() {
            const key = uuid()
            message.loading({ key, content: "正在保存", duration: 0 })
            return key
        },
        onSuccess() {
            message.success("保存成功")
        },
        onError(e) {
            message.error(e.message || "保存失败")
        },
        onSettled(_data, _error, _variables, key) {
            if (key) message.destroy(key)
        },
    })

    useEffect(() => {
        if (!open) return

        if (!isUpdate) {
            form.resetFields()

            form.setFieldsValue({
                grant_types: ["authorization_code", "refresh_token"],
                response_types: ["code"],
                scope: "openid profile phone offline_access",
                token_endpoint_auth_method: "client_secret_basic",
                application_type: "web",
            })

            return
        }

        if (!data) return

        form.setFieldsValue({
            client_id: data.client_id,
            client_secret: data.client_secret,
            redirect_uris: data.redirect_uris,
            grant_types: data.grant_types,
            response_types: data.response_types,
            scope: data.scope ?? undefined,
            token_endpoint_auth_method: data.token_endpoint_auth_method ?? undefined,
            application_type: data.application_type ?? undefined,
            client_name: data.client_name ?? undefined,
            is_first_party: data.is_first_party,
        })
    }, [open, isUpdate, data, form])

    const isRequesting = isLoading || isCreatePending || isUpdatePending

    async function onFinish(values: FormValues) {
        const payload: OidcClientParams = {
            client_id: values.client_id!,
            client_secret: values.client_secret || undefined,
            redirect_uris: values.redirect_uris || [],
            grant_types: values.grant_types?.length ? values.grant_types : ["authorization_code", "refresh_token"],
            response_types: values.response_types?.length ? values.response_types : ["code"],
            scope: values.scope || undefined,
            token_endpoint_auth_method: values.token_endpoint_auth_method || undefined,
            application_type: values.application_type || undefined,
            client_name: values.client_name || undefined,
            is_first_party: values.is_first_party,
        }

        if (!isUpdate) {
            await createAsync(payload)
            onClose?.()
            return
        }

        await updateAsync({ client_id: clientId!, patch: payload })
        onClose?.()
    }

    return (
        <Modal open={open} onCancel={onClose} title={isUpdate ? `编辑：${clientId}` : "新增接入方（OIDC Client）"} footer={null} destroyOnHidden {...rest}>
            <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
                <FormItem<FormValues> name="client_id" label="Client ID" rules={[{ required: true, message: "请输入 client_id" }]}>
                    <Input disabled={isUpdate || isRequesting} placeholder="例如：my-rp-app" autoComplete="off" />
                </FormItem>

                <FormItem<FormValues> name="client_name" label="显示名称（可选）">
                    <Input disabled={isRequesting} placeholder="例如：My RP App" autoComplete="off" />
                </FormItem>

                <FormItem<FormValues> name="redirect_uris" label="Redirect URIs" rules={[{ required: true, message: "至少配置一个 redirect_uri" }]}>
                    <Select
                        disabled={isRequesting}
                        mode="tags"
                        tokenSeparators={[",", " ", "\n", "\t"]}
                        placeholder="回车添加；例如：http://localhost:8080/callback"
                    />
                </FormItem>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormItem<FormValues> name="grant_types" label="Grant Types">
                        <Select
                            disabled={isRequesting}
                            mode="tags"
                            options={knownGrantTypes.map(v => ({ value: v, label: v }))}
                            placeholder="默认：authorization_code + refresh_token"
                        />
                    </FormItem>
                    <FormItem<FormValues> name="response_types" label="Response Types">
                        <Select disabled={isRequesting} mode="tags" options={knownResponseTypes.map(v => ({ value: v, label: v }))} placeholder="默认：code" />
                    </FormItem>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormItem<FormValues> name="token_endpoint_auth_method" label="Token Endpoint Auth Method（可选）">
                        <Select
                            disabled={isRequesting}
                            options={[
                                { value: "client_secret_basic", label: "client_secret_basic" },
                                { value: "client_secret_post", label: "client_secret_post" },
                                { value: "none", label: "none" },
                            ]}
                            placeholder="默认：client_secret_basic"
                        />
                    </FormItem>
                    <FormItem<FormValues> name="application_type" label="Application Type（可选）">
                        <Select
                            disabled={isRequesting}
                            options={[
                                { value: "web", label: "web" },
                                { value: "native", label: "native" },
                            ]}
                            placeholder="默认：web"
                        />
                    </FormItem>
                </div>

                <FormItem<FormValues> name="scope" label="Scope（可选）">
                    <Input disabled={isRequesting} placeholder="默认：openid profile phone offline_access" autoComplete="off" />
                </FormItem>

                <FormItem<FormValues> name="client_secret" label={isUpdate ? "Client Secret（可编辑）" : "Client Secret（可选，不填则自动生成）"}>
                    <Input.Password disabled={isRequesting} placeholder={isUpdate ? "留空表示不变（如不想改）" : "留空将自动生成"} autoComplete="off" />
                </FormItem>

                <FormItem<FormValues> name="is_first_party" label="信任应用（跳过授权提示）" valuePropName="checked">
                    <Switch disabled={isRequesting} />
                </FormItem>

                <div className="flex justify-end gap-2">
                    <Button onClick={onClose} disabled={isRequesting}>
                        取消
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isRequesting}>
                        保存
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}

export default OidcClientEditor
