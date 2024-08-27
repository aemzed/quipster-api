import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.requestV3

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        price1: number, 
        price2: number,
        price3: number,
        price4: number,
        price5: number,
        notes: string, 
        detail: string,
        use_price_distributor: string,
        price_distributor: string,
        mobile: number,
        duplicate: string
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: string,
        name: string,
        price1: number, 
        price2: number,
        price3: number,
        price4: number,
        price5: number,
        notes: string, 
        detail: string,
        use_price_distributor: string,
        price_distributor: string,
        mobile: number,
        duplicate: string
    }
}

export type updatePriceV3 = typeGlobal.requestV3 & {
    body: {
        code: string,
        name: string,
        price: number, 
        price2: number,
        price3: number,
        price4: number,
        price5: number,
        notes: string, 
        detail: string,
        use_price_distributor: string,
        price_distributor: string,
        mobile: number,
        price_net_manual: number,
        price_net: number
    }
}
