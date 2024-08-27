import * as typeBusiness from './business'
import * as typeCustomer from './customer'
import * as typeSalestype from './sales_type'
import * as typeUser from './user'
import moment from 'moment'

export type transaction = {
    readonly code: number,
    offlinecode: string,
    fk_business: number,
    fk_customer?: number,
    fk_salestype?: number,
    ordernumber: number,
    guest?: string,
    total?: number,
    totalpromotion?: number,
    vatnominal?: number,
    scnominal?: number,
    pph23?: number,
    totalnet?: number,
    rounded?: number,
    changes?: number,
    totalvoid?: number,
    vat?: number,
    sc?: number,
    notes?: string,
    issplit: number,
    email?: string,
    paidby?: string,
    userpaid?: number,
    dt_paid?: string,
    ispaid?: number,
    dt_void?: string,
    isvoid: number,
    voidreason?: string,
    createdby: string,
    usercreate: number,
    dt_created: string,
    receivenotes?: string,
    receivephoto?: string,
    dt_receive?: string,
    process: number,
    process_photo: string,
    dt_process?: string,
    isactive: number,
    dt_database: string
}

export type transactiondetail = {
    readonly code: number,
    fk_business: number,
    fk_transaction: number,
    fk_item: number,
    fk_unit: number,
    profit_sharing_name: string,
    profit_sharing: number,
    type: number,
    qty: number,
    price: number,
    pricenet?: number,
    pph?: number,
    preference?: string,
    isprinted?: number,
    voidreason?: string,
    voidby?: string,
    dt_void?: string,
    isvoid?: number,
    paidby?: string,
    fk_userpaid?: number,
    dt_paid?: string,
    ispaid?: number,
    createdby: string,
    fk_usercreate: string,
    dt_created: string,
    isactive: number,
    aftervoiditem: number,
}

export type saveTransactionPayment = {
    paymentCode: string,
    paymentName: string,
    paymentInformation: string,
    paymentValue: string,
}

export type saveTransactionItemAdditional = {
    additionalCode: string,
    additionalName: string,
    additionalQty: string,
    additionalPrice: string
}

export type saveTransactionItemPromotion = {
    promotionCode: string,
    promotionName: string,
    promotionValue: string,
    promotionValueName: string,
    promotionType: string,
    promotionPin: string,
    promotionMinimumSpend: string,
    promotionMaximumPromo: string
}

export type saveTransactionItemEmployee = {
    employeeCode: number
}

export type saveTransactionItem = {
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
    dtvoid: string,
    voidby: string,
    voidreason: string,
    iscompliment?: string,
    hasstock: string,
    detail: string,
}

export type saveTransaction = {
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
        paidby: string,
        datepaid: string,
    }
}