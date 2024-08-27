import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.requestV3

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: string,
        alias: string, 
        type: number,
        value: string,
        start: string, 
        end: string,
        notes: string, 
        usepin: number,
        pin: string,
        minimumSpend: number,
        maximumPromo: number,
        online: number,
        monday: number,
        tuesday: number,
        wednesday: number,
        thursday: number,
        friday: number,
        saturday: number,
        sunday: number
    }
}