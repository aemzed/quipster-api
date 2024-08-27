import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.requestV3

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}