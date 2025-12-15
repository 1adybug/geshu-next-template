export interface OidcClientRecord {
    client_id: string
    client_secret: string
    redirect_uris: string[]
    grant_types: string[]
    response_types: string[]
    scope?: string
    token_endpoint_auth_method?: string
    application_type?: string
    client_name?: string
    is_first_party: boolean
    createdAt: string
    updatedAt: string
}
