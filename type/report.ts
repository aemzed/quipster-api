import * as typeGlobal from "./global"

export type report = typeGlobal.requestV3 & {
    body: {
        date_start: string,
        date_end: string
    }
}

export type expense = {
    code: string,
    type: string,
    name: string,
    receipt: string,
    date: string,
    type_ash: string,
    total: string,
    notes: string,
    image: string
}


export type stockComplete = {
    code: string,
    type: string,
    name: string,
    customcode: string,
    unitname: string,
    category: string,
    production: string,
    po: string,
    adjustment: string,
    transfer: string,
    transactions: string,
    voids: string,
    first: string,
    plus: string,
    minus: string,
    plus_hpp: string,
    minus_hpp: string
}

export type getShiftReport = typeGlobal.requestV3 & {
    body: {
        date_start: string,
        date_end: string
    }
}

export type getAbsenceReport = {
    body: {
        business: string,
        date_start: string,
        date_end: string
    }
}

export type listAddOn = {
    headers: {
        'x-auth-token': string
    },
    body: {}
}

export type absence = report

export type categorySummary = report

export type commision = report

export type commision_statement = report & {
    body : {
        employee: string
    }
}

export type dailySales = report

export type day = report

export type discount = report

export type expenseV3 = report

export type hourV3 = report

export type hourlySalesV3 = report

export type invoicePaidV3 = report

export type profitSharingV3 = report & {
    body: {
        consolidation: string | undefined
    }
}

export type profitSharingDetailV3 = report & {
    body: {
        item_code: string
    }
}

export type purchaseOrderDetailV3 = report

export type purchaseOrderSummaryV3 = report

export type revenueV3 = report & {
    body : {
        consolidation?: string
    }
}

export type salesV3 = report & {
    body: {
        void_status?: string
    }
}

export type superSellingV3 = typeGlobal.requestV3 & {
    body: {
        date_start: string,
        date_end: string
    }
}
export type stockConsolidationV3 = typeGlobal.requestV3 & {
    body: {
        date: string
    }
}

export type stockConsolidationBusinessV3 = typeGlobal.requestV3

export type salesCompleteV3 = report & {
    body: {
        void_status?: string
    }
}

export type salesAdditionalV3 = report

export type salesCustomerV3 = report & {
    body: {
        customer: string
    }
}

export type salesCustomerProductV3 = report & {
    body: {
        customer: string
    }
}

export type salesCustomerDetailV3 = report & {
    body: {
        customer: string,
        product: string,
        type: string,
        price: string,
        promotion: string
    }
}

export type salesDetailV3 = typeGlobal.requestV3 & {
    body: {
        receipt: string
    }
}

export type salesProductV3 = report & {
    body: {
        order?: string
        order_type?: string
        limit?: string
    }
}

export type salesProductSimpleV3 = report & {
    body: {
        limit?: string
    }
}

export type salesProductDetailV3 = report & {
    body: {
        item_code: string,
        promotion_code: string,
        type: string,
        price: string,
        customer: string
    }
}

export type salesProductHPPV3 = report

export type shiftV3 = typeGlobal.requestV3 & {
    body: {
        date: string
    }
}

export type shiftDetailV3 = report

export type statementQrisV3 = report

export type stockMovingHeaderV3 = report

export type stockMovingDetailV3 = report & {
    body: {
        name: string,
        type: string
    }
}

export type stockAdjustmentV3 = report

export type stockOpnameV3 = report

export type stockOpnameDetailV3 = typeGlobal.requestV3 & {
    body: {
        hash: string
    }
}

export type stockOpnameIgnoreDetailV3 = typeGlobal.requestV3 & {
    body: {
        hash: string
    }
}

export type stockV3 = typeGlobal.requestV3 & {
    body: {
        date: string
    }
}

export type summaryV3 = report

export type transferStockDetailV3 = report

export type transferStockSummaryV3 = report

export type invoiceDetailV3 = typeGlobal.requestV3 & {
    body: {
        business: string,
        customer_code: string
    }
}

export type customerHistoryItemGroupV3 = report & {
    body: {
        customer: string
    }
}
export type customerHistoryItemV3 = report & {
    body: {
        customer: string
    }
}

export type customerHistoryTransactionV3 = report & {
    body: {
        customer: string
    }
}

export type invoiceV3 = typeGlobal.requestV3

export type invoiceHistoryV3 = typeGlobal.requestV3 & {
    body: {
        invoice_code: string
    }
}

export type salesProductByCustomerV3 = report

export type receiveV3 = report

export type priceItemV3 = report & {
    body: {
        item_code?: string
    }
}

export type priceMaterialV3 = report & {
    body: {
        material_code?: string
    }
}

export type salesProductDetailReceiptV3 = report & {
    body: {
        customer?: any,
        item_code?: any,
        type: any,
        promotion_code?: any,
        price?: any
    }
}

export type getTodayReportV3 = typeGlobal.requestV3 & {
    body: {
        createdby: any
    }
}

export type ticketSalesV3 = typeGlobal.requestV3

export type getReportExpenseTodayV3 = typeGlobal.requestV3 & {
    body: {
        user: string
    }
}