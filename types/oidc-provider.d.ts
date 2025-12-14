declare module "oidc-provider" {
    import type { IncomingMessage, ServerResponse } from "http"

    export type InteractionDetails = {
        uid: string
        prompt?: {
            name?: string
            details?: Record<string, unknown>
        }
        params: Record<string, unknown>
        client?: {
            clientId: string
            clientName?: string
        }
        session?: {
            accountId?: string
        }
        grantId?: string
    }

    export type InteractionFinishedOptions = {
        mergeWithLastSubmission?: boolean
    }

    export default class Provider {
        constructor(issuer: string, configuration: Record<string, unknown>)
        callback(): (request: IncomingMessage, response: ServerResponse) => unknown
        interactionDetails(request: IncomingMessage, response: ServerResponse): Promise<InteractionDetails>
        interactionResult(
            request: IncomingMessage,
            response: ServerResponse,
            result: Record<string, unknown>,
            options: InteractionFinishedOptions,
        ): Promise<string>
        interactionFinished(request: IncomingMessage, response: ServerResponse, result: Record<string, unknown>, options: InteractionFinishedOptions): unknown
    }
}
