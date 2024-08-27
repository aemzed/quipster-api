import * as typeGlobal from "./global"

export type absenceType = {
    code: number,
    name: string,
    start_hour: string,
    start_minute: string,
    end_hour: string,
    end_minute: string,
    zone: string,
}


export type get = {
    business: string
}


export type insert = {
    user_modify: number,
    business: string,
    name: string,
    start_hour: string,
    start_minute: string,
    end_hour: string,
    end_minute: string,
    zone: string
}


export type update = {
    business: string,
    code: string,
    name: string,
    start_hour: string,
    start_minute: string,
    end_hour: string,
    end_minute: string,
    zone: string
}


export type del = {
    code: string
}

export type selectV3 = typeGlobal.requestV3 & {
    body: {
        keyword?: any,
        name?: any,
        order?: any,
        start?: any,
        limit?: any
    }
}

export type insertV3 = typeGlobal.requestV3 & {
    body: {
        name: any,
        start_hour: any,
        start_minute: any,
        end_hour: any,
        end_minute: any,
        zone?: any,
    }
}

export type selectSystemV3 = typeGlobal.requestV3

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        code: any
        name: any,
        start_hour: any,
        start_minute: any,
        end_hour: any,
        end_minute: any,
        zone?: any,
    }
}

export type deleteV3 = typeGlobal.requestV3 & {
    body: {
        code: string
    }
}
