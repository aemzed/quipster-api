import * as typeGlobal from "./global"

export type select = {
    body: {
        business: string
    }
}

export type insert = {
    body: {
        business: string,
        name: string,
        email: string,
        idnumber: string,
        gender?: string,
        address: string,
        phone: string,
        pin: string
    }
}

export type update = {
    body: {
        code: string,
        name: string,
        email: string,
        idnumber: string,
        gender: string,
        address: string,
        phone: string,
        pin: string
    }
}

export type remove = {
    body : {
        code: string
    }
}

export type selectV3 = typeGlobal.requestV3

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        email: string,
        idnumber: string,
        gender: string,
        address: string,
        phone: string,
        pin: string
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        email: string,
        idnumber: string,
        gender: string,
        address: string,
        phone: string,
        pin: string,
        code: string
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}