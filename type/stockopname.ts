import * as typeGlobal from "./global"

export type getDetailV3 = typeGlobal.requestV3 & {
    body: {
        id: any
    }
}
export type insertV3 = typeGlobal.requestV3 & {
    body: {
        items: Array<{
            code: any,
            type: any
        }>
    }
}

export type updateDetailV3 = typeGlobal.requestV3 & {
    body: {
        id_stockopname_detail: any,
        qty: any,
        type: any,
        date_input: any
    }
}

export type selectV3 = typeGlobal.requestV3 & {
    body: {
        date_start: string,
        date_end: string
    }
}