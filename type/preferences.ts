import * as typeGlobal from "./global"

export type preferences = {
    code: number,
    name: string
}


export type selectV3 = typeGlobal.requestV3


export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: string
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: string,
        name: string
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}