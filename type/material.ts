import * as typeGlobal from '../type/global'

export type select = {
    body: {
        business: string
    }
}

export type addStock = {
    body: {
        business: string,
        code: string,
        qty: string,
        notes: string
    }
}

export type addStockV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        qty: any,
        notes: any
    }
}