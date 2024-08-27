import * as typeGlobal from "../type/global"

export type getPointV3 = typeGlobal.requestV3 & {
    body: {
        customer_code: string
    }
}

export type showCodeV3 = typeGlobal.requestV3 & {
    body: {
        table: string,
        code: any,
    }
}

export type selectV3 = typeGlobal.requestV3 & {
    body: {
        keyword?: string,
        order?: string,
        start?: string,
        limit?: string,
        name?: string,
        filter_new_customer?: string,
        filter_recurring_customer?: string,
        filter_gender?: string,
        filter_birthdate?: string,
        filter_favorite_item?: string,
        filter_item_bought_by_transaction?: string,
        filter_category_bought_by_transaction?: string,
        filter_item_bought_by_nominal?: string,
        filter_category_bought_by_nominal?: string
        filter_item_bought_by_qty?: string,
        filter_category_bought_by_qty?: string,
    }
}

export type selectsV3 = typeGlobal.requestV3

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        alias?: string,
        name: string,
        email?: string,
        id_number?: string,
        date_birth?: string,
        birthdate?: string,
        gender: string,
        address: string,
        phone: string,
        notes?: string,
        plafond?: string,
        price?: string
    }
}

export type insertUnsolvedV3 = typeGlobal.requestV3 & {
    body: {
        alias?: string,
        name: string,
        email?: string,
        id_number?: string,
        date_birth: string,
        gender: string,
        address: string,
        phone: string,
        notes?: string,
        plafond?: string,
        price?: string
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        customcode: string,
        name: string,
        email: string,
        idnumber: string,
        birthdate: string,
        gender: string,
        address: string,
        phone: string,
        notes: string,
        plafond: number,
        price: number,
        code: string,
    }
}