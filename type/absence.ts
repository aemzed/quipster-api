import * as typeGlobal from "./global"
export type checkAbsences = {
    body: {
        employee: string
    }
}

export type insertAbsences = {
    body: {
        business: string,
        user: string,
        employee?: string,
        absence_type: string,
        hash?: string,
        date: string,
        image: string,
        latitude: string,
        longitude: string,
        pin: string,
        customercode: string,
        notes: string
    }
}

export type checkV3 = typeGlobal.requestV3 & {
    body: {
        employee: string
    }
}