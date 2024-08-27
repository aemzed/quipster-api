import * as typeGlobal from "./global"

export type unit = {
    code: number,
    name: string
}

export type selectV3 = typeGlobal.requestV3

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        system: string,
        smallest?: string,
        conversion?: string,
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: string,
        name: string,
        system: string,
        smallest?: string,
        conversion?: string,
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}

export type selectSimilarV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}