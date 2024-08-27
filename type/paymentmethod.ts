import * as typeGlobal from "./global"

export type paymentmethod = {
    readonly code: number,
    fk_business: number,
    fk_systempaymentmethod: number,
    name: string,
    mdr: number,
    tax: boolean,
    sc: boolean,
    notes: string,
    dt_created: string,
    is_active: boolean
}

export type selectV3 = typeGlobal.requestV3

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        fk_business: number,
        name: string,
        system: number,
        systempaymentmethod: number,
        notes: string,
        mdr: string,
    }
}

export type selectSystemV3 = typeGlobal.requestV3

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        fk_business: number,
        name: string,
        system: number,
        systempaymentmethod: number,
        notes: string,
        mdr: number,
        code: string,
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}

export type selectSimilarV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}