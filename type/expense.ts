import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.requestV3

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        system: number
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        system: string,
        code: string
    }
}

export type selectSimilarV3 = typeGlobal.requestV3 & {
    body: {
        code: any
    }
}

export type deleteOperationalExpenseV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}