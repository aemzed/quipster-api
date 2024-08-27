import * as typeGlobal from "./global"

export type salesType = {
    i_code: number,
    fk_business: number,
    fk_systemsalestype: number,
    v_name: string,
    b_tax: number,
    b_sc: number,
    dt_created: string,
    b_isactive: string
}

export type selectV3 = typeGlobal.selectV3

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        system: string,
        tax?: string,
        sc?: string
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: string,
        name: string,
        system: string,
        tax: string,
        sc: string
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: number
    }
}