export function checkSelect<
    Model,
    OmitKeys extends keyof Model = never,
    Select extends Record<Exclude<keyof Model, OmitKeys>, unknown> = Record<Exclude<keyof Model, OmitKeys>, unknown>,
>(select: Select) {}
