import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.selectV3 & {
    body: {
        start?: any,
        limit?: any,
        order?: any,
        keyword?: any,
        name?: any,
        stock?: any,
        online?: any,
        category?: any,
        formula?: any
    }
}

export type insertV3 = typeGlobal.requestV3 & {
    body: {
       sku?: any,
       customcode?: any,
       name: any,
       category_code: any,
       formula?: any,
       stock?: any,
       unit_code: any,
       unit_variance?: any,
       notes?: any,
       qty?: any,
       qty_alert?: any,
       price_net?: any,
       price?: any,
       price2?: any,
       price3?: any,
       price4?: any,
       price5?: any,
       price_point?: any,
       all_branch?: any,
       is_limit?: any,
       show_online_store?: any,
       recommendation?: any,
       mobile?: any,
       use_price_distributor?: any,
       price_distributors?: any,
       duplicate?: any,
       prevent_favorite?: any
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        name: any,
        sku: any,
        category_code: any,
        formula: any,
        stock: any,
        qty_alert?: any,
        unit_code: any,
        unit_variance?: any,
        notes?: any,
        show_online_store: any,
        recommendation: any,
        duplicate?:any
    }
}
export type updateCommissionV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        type: any,
        commission: any,
    }
}

export type updatePriceV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        hpp_manual: any,
        hpp: any,
        price: any,
        price2: any,
        price3: any,
        price4: any,
        price5: any,
        point: any,
        use_price_distributor?: any,
        price_distributor: any
    }
}

export type selectSimilarV3 = typeGlobal.requestV3 & {
    body: {
        code: any
    }
}

export type formulaProcessV3 = typeGlobal.requestV3 & {
    body: {
        item_code: any,
        qty: any
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: any
    }
}

export type updateImageV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        image: any
    }
}

export type addStockV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        qty: any,
        notes: any
    }
}

export type deleteImageV3 = typeGlobal.requestV3 & {
    body: {
        code: any
    }
}