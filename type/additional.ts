import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.requestV3 & {
    body: {
        filter_name: string,
        filter_key: string
        filter_start: number,
        filter_limit: number,
        filter_order: string,
        output_language: string
    }
}

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        fk_business: any,
        name: any,
        price: any,
        hpp: any,
        notes: any
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: string,
        name: string,
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}

export type updatePriceV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        price: any,
        hpp: any
    }
}

export type selectSimilarV3 = typeGlobal.requestV3 & {
    body: {
        code: any
    }
}