import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.requestV3 & {
    body: {
        date_start: string,
        date_end: string,
        language?: string
    }
}

export type detailV3 = typeGlobal.requestV3 & {
    body: {
        purchase_order_code: string
    }
}

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        supplier_code: string,
        receipt: string,
        date_order: string,
        notes: string,
        subtotal: string,
        tax: string,
        discount: string,
        extra: string,
        total: string,
        detail: string
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: string,
        supplier_code: string,
        receipt: string,
        date_order: string,
        notes: string,
        subtotal: string,
        tax: string,
        discount: string,
        extra: string,
        total: string,
        detail: string
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: number
    }
}

export type confirmV3 = typeGlobal.requestV3 & {
    body: {
        purchase_order_code: string,
        date_received: string
    }
}

export type itemMaterialV3 = typeGlobal.requestV3

export type paidV3 = typeGlobal.requestV3 & {
    body: {
        purchase_order_code: string,
        date_paid: string
    }
}

export type adjustPriceV3 = typeGlobal.requestV3 & {
    body: {
        purchase_order_detail_code: string,
        price: string
    }
}

export type voidV3 = typeGlobal.requestV3 & {
    body: {
        code: any,
        date_void: any
    }
}