import * as typeGlobal from "./global"

export type saveCartPayment = {
    paymentCode: string,
    paymentValue: string,
    paymentInformation: string
}

export type saveCartItemPromotion = {
    promotionCode: string,
    promotionValue: string,
    promotionType: string
}

export type saveCartItemAdditional = {
    additionalCode: string,
    additionalPrice: string,
    additionalQty: string
}

export type saveCartItem = {
    code: string,
    customcode: string,
    name: string,
    image: string,
    category: string,
    categorycode: string,
    categorypph: string,
    sellingprice: string,
    qty: string,
    unit: string,
    preferences: string,
    employee: string,
    additional: string,
    promotion: string,
    isprinted: string,
    ispackage: string,
    ispaid: string,
    isvoid: string,
    voidby?: string,
    dtvoid?: string,
    voidreason?: string,
    hasstock: string,
    detail: string
}
export type saveCart = {
    body: {
        business: string,
        ordernumber: string,
        guest: string,
        email: string,
        offlinecode: string,
        server: string,
        date: string,
        customer: string,
        customername: string,
        salestype: string,
        tax: string,
        servicecharge: string,
        item: string,
        promotion: string,
        payment: string,
        splitbill: string
    }
}

export type getOpenCart = {
    body: {
        business: string,
        createdby: string,
        role: string
    }
}

export type selectV3 = typeGlobal.requestV3 & {
    body: {
        online: string,
        language: string,
    }
}

export type saveV3 = typeGlobal.requestV3 & {
    body: {
        order_number: string,
        guest: string,
        receipt: string,
        server: string,
        date: string,
        customer_code: string,
        customer_name: string,
        sales_type: string,
        tax: string,
        service_charge: string,
        item: string,
        promotion: string,
        payment: string,
        paid_by?: string,
        date_paid?: string,
        issplit?: string,
    }
}

export type EXACT_saveV3 = typeGlobal.requestV3 & {
    body: {
        order_number: number,
        guest: number
    }
}

export type voidDetailV3 = typeGlobal.requestV3 & {
    body: {
        detail_code: any,
        reason: any
    }
}