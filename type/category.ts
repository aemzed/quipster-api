import * as typeGlobal from './global'

export type category = {
    code: number,
    name: string,
    count: number,
    pph: number
}


export type get = {
    business: string
}


export type insert = {
    business: string,
    name: string
}


export type update = {
    business: string,
    code: string,
    name: string
}


export type del = {
    code: string
}

export type selectSimiliarV3 = typeGlobal.requestV3 & {
    body: {
        code: any
    }
}