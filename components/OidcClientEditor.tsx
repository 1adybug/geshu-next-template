import { ComponentProps, FC, Fragment, useEffect } from "react"

import { addToast, Button, Form, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, SelectItem, Switch, Textarea } from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createRequestFn, isNonNullable } from "deepsea-tools"
import { addBetterToast, closeToast, FormInput, FormSelect } from "soda-heroui"

import { addOidcClientAction } from "@/actions/addOidcClient"
import { getOidcClientAction } from "@/actions/getOidcClient"
import { updateOidcClientAction } from "@/actions/updateOidcClient"

import { DefaultGrantTypes, DefaultResponseTypes, TokenEndpointAuthMethods } from "@/constants/oidc"

import { AddOidcClientParams, addOidcClientParser } from "@/schemas/addOidcClient"
import { idParser } from "@/schemas/id"
import { updateOidcClientParser } from "@/schemas/updateOidcClient"

import { getOnSubmit } from "@/utils/getOnSubmit"

export interface OidcClientEditorProps extends Omit<ComponentProps<typeof Modal>, "children"> {
    id?: string
}

function getDefaultValues(): AddOidcClientParams {
    return {
        name: "",
        description: "",
        redirectUris: "",
        postLogoutRedirectUris: "",
        grantTypes: DefaultGrantTypes.join(" "),
        responseTypes: DefaultResponseTypes.join(" "),
        scope: "",
        tokenEndpointAuthMethod: "client_secret_basic",
        enabled: true,
    }
}

const OidcClientEditor: FC<OidcClientEditorProps> = ({ id, isOpen, onClose, ...rest }) => {
    const isUpdate = isNonNullable(id)
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: getDefaultValues(),
        onSubmit({ value }) {
            return mutateAsync(value)
        },
    })

    const { data, isLoading } = useQuery({
        queryKey: ["get-oidc-client", id],
        queryFn: isNonNullable(id) ? createRequestFn(() => getOidcClientAction(idParser(id))) : () => Promise.resolve(null),
        enabled: !!isOpen,
    })

    const mutationFn = isUpdate
        ? createRequestFn((payload: AddOidcClientParams) => updateOidcClientAction(updateOidcClientParser({ ...payload, id })))
        : createRequestFn((payload: AddOidcClientParams) => addOidcClientAction(addOidcClientParser(payload)))

    const { mutateAsync, isPending } = useMutation({
        mutationFn,
        onMutate() {
            const key = addBetterToast({
                title: `${isUpdate ? "修改客户端" : "新增客户端"}中...`,
                loading: true,
            })

            return key
        },
        onSuccess(result) {
            addToast({
                title: `${isUpdate ? "修改客户端" : "新增客户端"}成功`,
                description: `${result.name}（${result.clientId}）`,
                color: "success",
            })
        },
        onSettled(_data, _error, _variables, context) {
            closeToast(context!)
            queryClient.invalidateQueries({ queryKey: ["query-oidc-client"] })
            queryClient.invalidateQueries({ queryKey: ["get-oidc-client", id] })
            onClose?.()
        },
    })

    useEffect(() => {
        if (!isOpen || !data) return

        form.reset({
            name: data.name,
            description: data.description ?? "",
            redirectUris: data.redirectUris.join("\n"),
            postLogoutRedirectUris: data.postLogoutRedirectUris.join("\n"),
            grantTypes: data.grantTypes.join(" "),
            responseTypes: data.responseTypes.join(" "),
            scope: data.scope ?? "",
            tokenEndpointAuthMethod: data.tokenEndpointAuthMethod,
            enabled: data.enabled,
        })
    }, [isOpen, data, form])

    useEffect(() => {
        if (isNonNullable(id)) return () => form.reset(getDefaultValues())
    }, [id, form])

    useEffect(() => {
        if (!isOpen && !isUpdate) form.reset(getDefaultValues())
    }, [isOpen, isUpdate, form])

    const isRequesting = isLoading || isPending

    return (
        <Modal isOpen={isOpen} onClose={onClose} {...rest}>
            <ModalContent>
                {onClose => (
                    <Fragment>
                        <ModalHeader>{isUpdate ? "编辑客户端" : "新增客户端"}</ModalHeader>
                        <ModalBody>
                            <Form onSubmit={getOnSubmit(form)}>
                                <div className="grid gap-3">
                                    <form.Field name="name" validators={{ onBlur: ({ value }) => value.trim().length > 0 || "请输入名称" }}>
                                        {field => <FormInput size="sm" isDisabled={isRequesting} field={field} label="名称" />}
                                    </form.Field>
                                    <form.Field name="description">
                                        {field => (
                                            <Textarea
                                                label="描述"
                                                labelPlacement="outside"
                                                minRows={2}
                                                isDisabled={isRequesting}
                                                value={field.state.value}
                                                onValueChange={field.handleChange}
                                                onBlur={field.handleBlur}
                                            />
                                        )}
                                    </form.Field>
                                    <form.Field name="redirectUris">
                                        {field => (
                                            <Textarea
                                                label="回调地址"
                                                labelPlacement="outside"
                                                placeholder="每行一个回调地址"
                                                minRows={3}
                                                isDisabled={isRequesting}
                                                isInvalid={field.state.meta.errors.length > 0}
                                                errorMessage={field.state.meta.errors.join(", ")}
                                                value={field.state.value}
                                                onValueChange={field.handleChange}
                                                onBlur={field.handleBlur}
                                            />
                                        )}
                                    </form.Field>
                                    <form.Field name="postLogoutRedirectUris">
                                        {field => (
                                            <Textarea
                                                label="登出回调地址"
                                                labelPlacement="outside"
                                                placeholder="可选，每行一个地址"
                                                minRows={2}
                                                isDisabled={isRequesting}
                                                value={field.state.value}
                                                onValueChange={field.handleChange}
                                                onBlur={field.handleBlur}
                                            />
                                        )}
                                    </form.Field>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <form.Field name="grantTypes">
                                            {field => (
                                                <FormInput
                                                    size="sm"
                                                    isDisabled={isRequesting}
                                                    field={field}
                                                    label="授权类型"
                                                    description="空格分隔，例如 authorization_code refresh_token"
                                                />
                                            )}
                                        </form.Field>
                                        <form.Field name="responseTypes">
                                            {field => (
                                                <FormInput
                                                    size="sm"
                                                    isDisabled={isRequesting}
                                                    field={field}
                                                    label="响应类型"
                                                    description="默认 code，可用空格分隔多个值"
                                                />
                                            )}
                                        </form.Field>
                                    </div>
                                    <form.Field name="scope">
                                        {field => <FormInput size="sm" isDisabled={isRequesting} field={field} label="Scope" placeholder="可选，空格分隔" />}
                                    </form.Field>
                                    <form.Field name="tokenEndpointAuthMethod">
                                        {field => (
                                            <FormSelect size="sm" isDisabled={isRequesting} field={field} label="令牌端认证方式">
                                                {TokenEndpointAuthMethods.map(method => (
                                                    <SelectItem key={method}>{method}</SelectItem>
                                                ))}
                                            </FormSelect>
                                        )}
                                    </form.Field>
                                    <form.Field name="enabled">
                                        {field => (
                                            <Switch
                                                size="sm"
                                                isDisabled={isRequesting}
                                                isSelected={field.state.value}
                                                onBlur={field.handleBlur}
                                                onValueChange={field.handleChange}
                                            >
                                                启用
                                            </Switch>
                                        )}
                                    </form.Field>
                                    <Button className="hidden" type="submit" isDisabled={isRequesting}>
                                        确定
                                    </Button>
                                </div>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button size="sm" isDisabled={isRequesting} variant="light" onPress={onClose}>
                                取消
                            </Button>
                            <Button size="sm" isDisabled={isRequesting} color="primary" onPress={form.handleSubmit}>
                                确定
                            </Button>
                        </ModalFooter>
                    </Fragment>
                )}
            </ModalContent>
        </Modal>
    )
}

export default OidcClientEditor
