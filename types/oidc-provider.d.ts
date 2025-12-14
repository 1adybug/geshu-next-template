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
        callback(): (req: IncomingMessage, res: ServerResponse) => unknown
        interactionDetails(req: IncomingMessage, res: ServerResponse): Promise<InteractionDetails>
        interactionResult(req: IncomingMessage, res: ServerResponse, result: Record<string, unknown>, options: InteractionFinishedOptions): Promise<string>
        interactionFinished(req: IncomingMessage, res: ServerResponse, result: Record<string, unknown>, options: InteractionFinishedOptions): unknown
    }
}
