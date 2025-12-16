import { ComponentProps, FC, useEffect, useState } from "react"

import { Button, Form, Input, message, Modal, Select, Switch } from "antd"
import { useForm } from "antd/es/form/Form"
import FormItem from "antd/es/form/FormItem"
import { isNonNullable } from "deepsea-tools"

import { createOidcClientClient } from "@/hooks/useCreateOidcClient"
import { useGetOidcClient } from "@/hooks/useGetOidcClient"
import { updateOidcClientClient } from "@/hooks/useUpdateOidcClient"

import { OidcClientParams } from "@/schemas/oidcClient"

import { uuid } from "@/utils/uuid"

export interface FormValues extends Omit<OidcClientParams, "grant_types" | "response_types"> {
    grant_types?: string[]
    response_types?: string[]
}

export interface OidcClientEditorProps extends Omit<ComponentProps<typeof Modal>, "title" | "children" | "onOk" | "onCancel" | "confirmLoading" | "okText"> {
    clientId?: string
    onClose?: () => void
}

export interface ErrorLike {
    message?: unknown
}

const knownGrantTypes = ["authorization_code", "refresh_token", "client_credentials", "implicit"]

const knownResponseTypes = ["code", "id_token", "code id_token"]

const OidcClientEditor: FC<OidcClientEditorProps> = ({ clientId, open, onClose, ...rest }) => {
    const isUpdate = isNonNullable(clientId)
    const [form] = useForm<FormValues>()
    const [isSubmitting, setSubmitting] = useState(false)

    const { data, isLoading, error } = useGetOidcClient({ client_id: clientId, enabled: !!open && isUpdate })

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
    }, [open, isUpdate, form])

    useEffect(() => {
        if (!open || !isUpdate) return
        if (error) message.error((error as Error).message || "加载失败")
    }, [open, isUpdate, error])

    useEffect(() => {
        if (!open || !isUpdate || !data) return

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

    const isRequesting = isLoading || isSubmitting

    function getErrorMessage(error: unknown, fallback: string) {
        if (error instanceof Error && error.message) return error.message
        if (typeof error !== "object" || !error) return fallback
        if (!("message" in error)) return fallback
        const { message } = error as ErrorLike
        if (typeof message !== "string" || !message.trim()) return fallback
        return message
    }

    async function onFinish(values: FormValues) {
        setSubmitting(true)

        try {
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

            const key = uuid()

            if (!isUpdate) {
                message.loading({ key, content: "正在创建", duration: 0 })

                try {
                    const d = await createOidcClientClient(payload)
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
                } catch (e: unknown) {
                    message.error(getErrorMessage(e, "创建失败"))
                    throw e
                } finally {
                    message.destroy(key)
                }

                onClose?.()
                return
            }

            message.loading({ key, content: "正在保存", duration: 0 })

            try {
                await updateOidcClientClient({
                    client_id: clientId!,
                    patch: {
                        client_secret: values.client_secret?.trim() ? values.client_secret : undefined,
                        redirect_uris: payload.redirect_uris,
                        grant_types: payload.grant_types,
                        response_types: payload.response_types,
                        scope: payload.scope,
                        token_endpoint_auth_method: payload.token_endpoint_auth_method,
                        application_type: payload.application_type,
                        client_name: payload.client_name,
                        is_first_party: payload.is_first_party,
                    },
                })
                message.success("保存成功")
            } catch (e: unknown) {
                message.error(getErrorMessage(e, "保存失败"))
                throw e
            } finally {
                message.destroy(key)
            }

            onClose?.()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={isUpdate ? `编辑：${clientId}` : "新增接入方（OIDC Client）"}
            footer={null}
            width={680}
            destroyOnHidden
            {...rest}
        >
            <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
                <FormItem<FormValues>
                    name="client_id"
                    label="Client ID"
                    rules={[{ required: true, message: "请输入 client_id" }]}
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>这是一条「接入方」在身份系统里的唯一编号，你的应用会在发起登录时把它作为参数（client_id）带上。</div>
                            <div>{isUpdate ? "创建后通常不建议改动（本页面也已锁定）。" : "建议用有含义且稳定的短字符串，例如：my-rp-app。"}</div>
                        </div>
                    }
                >
                    <Input disabled={isUpdate || isRequesting} placeholder="例如：my-rp-app" autoComplete="off" />
                </FormItem>

                <FormItem<FormValues>
                    name="client_name"
                    label="显示名称（可选）"
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>仅用于后台/列表里展示，方便你自己识别这是谁的应用；不参与任何登录校验。</div>
                            <div>例如：官网 Web、移动端 App、内部工具等。</div>
                        </div>
                    }
                >
                    <Input disabled={isRequesting} placeholder="例如：My RP App" autoComplete="off" />
                </FormItem>

                <FormItem<FormValues>
                    name="redirect_uris"
                    label="Redirect URIs"
                    rules={[{ required: true, message: "至少配置一个 redirect_uri" }]}
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>用户登录成功后，身份系统会把用户带回到你的应用；这里就是「跳回去的地址」（回调地址）。</div>
                            <div>必须与应用真实的回调地址完全一致（包含协议/域名/端口/路径），否则会被拒绝以防钓鱼。</div>
                            <div>可配置多个（例如开发/测试/生产环境）；回车添加，或用逗号/空格分隔。</div>
                        </div>
                    }
                >
                    <Select
                        disabled={isRequesting}
                        mode="tags"
                        tokenSeparators={[",", " ", "\n", "\t"]}
                        placeholder="回车添加；例如：http://localhost:8080/callback"
                    />
                </FormItem>
                <FormItem<FormValues>
                    name="grant_types"
                    label="Grant Types"
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>表示这个接入方「允许使用哪些方式」来获取登录凭证（Token）。</div>
                            <div>
                                一般网页应用推荐：<span className="font-mono">authorization_code</span> + <span className="font-mono">refresh_token</span>
                                （默认值）。
                            </div>
                            <div>
                                <span className="font-mono">client_credentials</span> 常用于机器对机器；<span className="font-mono">implicit</span>{" "}
                                已不推荐（安全性更差）。
                            </div>
                        </div>
                    }
                >
                    <Select
                        disabled={isRequesting}
                        mode="tags"
                        options={knownGrantTypes.map(v => ({ value: v, label: v }))}
                        placeholder="默认：authorization_code + refresh_token"
                    />
                </FormItem>
                <FormItem<FormValues>
                    name="response_types"
                    label="Response Types"
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>表示在「授权回调」时，身份系统会返回哪些内容给你的应用。</div>
                            <div>
                                通常保持默认：<span className="font-mono">code</span>（配合授权码流程）。
                            </div>
                            <div>
                                <span className="font-mono">id_token</span> / <span className="font-mono">code id_token</span> 属于隐式/混合流程，一般不需要。
                            </div>
                        </div>
                    }
                >
                    <Select disabled={isRequesting} mode="tags" options={knownResponseTypes.map(v => ({ value: v, label: v }))} placeholder="默认：code" />
                </FormItem>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormItem<FormValues>
                        name="token_endpoint_auth_method"
                        label="Token Endpoint Auth Method（可选）"
                        extra={
                            <div className="text-xs leading-5 text-neutral-500">
                                <div>你的应用在「换取/刷新 Token」时，如何向身份系统证明“我是我”。</div>
                                <div>
                                    <span className="font-mono">client_secret_basic</span>：把 <span className="font-mono">client_id</span>/
                                    <span className="font-mono">client_secret</span> 放在 HTTP Basic 认证头里（常用）。
                                </div>
                                <div>
                                    <span className="font-mono">client_secret_post</span>：把它们放在请求表单里；<span className="font-mono">none</span>：不需要
                                    secret（公开客户端，如纯前端/移动端）。
                                </div>
                            </div>
                        }
                    >
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
                    <FormItem<FormValues>
                        name="application_type"
                        label="Application Type（可选）"
                        extra={
                            <div className="text-xs leading-5 text-neutral-500">
                                <div>用于区分应用形态，影响部分默认安全策略。</div>
                                <div>
                                    <span className="font-mono">web</span>：有后端，可较安全地保存 <span className="font-mono">client_secret</span>
                                    （常见网站/服务端应用）。
                                </div>
                                <div>
                                    <span className="font-mono">native</span>：移动/桌面应用，无法可靠保密 secret，通常需要配合更严格的安全措施（如 PKCE）。
                                </div>
                            </div>
                        }
                    >
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

                <FormItem<FormValues>
                    name="scope"
                    label="Scope（可选）"
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>你的应用希望获取的「权限范围」，用空格分隔。</div>
                            <div>
                                <span className="font-mono">openid</span> 基本必需；<span className="font-mono">profile</span>/
                                <span className="font-mono">phone</span> 获取更多用户信息；
                                <span className="font-mono">offline_access</span> 允许返回 <span className="font-mono">refresh_token</span>（可长期登录）。
                            </div>
                            <div>权限越少，用户授权内容越少；不确定就先用默认值。</div>
                        </div>
                    }
                >
                    <Input disabled={isRequesting} placeholder="默认：openid profile phone offline_access" autoComplete="off" />
                </FormItem>

                <FormItem<FormValues>
                    name="client_secret"
                    label={isUpdate ? "Client Secret（可编辑）" : "Client Secret（可选，不填则自动生成）"}
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>相当于这条接入方的「密码」。服务端在换取/刷新 Token 时会用到，必须保密，泄露后应立即重置。</div>
                            <div>
                                {isUpdate ? "编辑时留空表示不修改；只有你确认要更换 secret 时才填写新值。" : "新增时可留空由系统自动生成（更安全也更省事）。"}
                            </div>
                        </div>
                    }
                >
                    <Input.Password disabled={isRequesting} placeholder={isUpdate ? "留空表示不变（如不想改）" : "留空将自动生成"} autoComplete="off" />
                </FormItem>

                <FormItem<FormValues>
                    name="is_first_party"
                    label="信任应用（跳过授权提示）"
                    valuePropName="checked"
                    extra={
                        <div className="text-xs leading-5 text-neutral-500">
                            <div>开启后，用户在登录时可能会「自动同意授权」，不再弹出确认页面（体验更顺滑）。</div>
                            <div>只建议对你自己完全可控的内部/自家应用开启；第三方应用请关闭以保护用户选择权。</div>
                        </div>
                    }
                >
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
