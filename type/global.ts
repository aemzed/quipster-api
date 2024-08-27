import { PoolConnection } from "mysql2"

export type functions = {
    connection: PoolConnection,
    res?: any
}

export type functionsGetDefault = {
    code?: string, 
    code_exclude?: string, 
    name?: string,
    where_extend?: string
}

export type functionsReport = {
    business: string,
    date_start: string,
    date_end: string
}

export type requestReportv1 = {
    business: string,
    startdate: string,
    enddate: string
}

export type requestBodySelectV3 = {
    keyword?: string,
    name?: string,
    start?: string,
    limit?: string,
    order?: string,
    order_type?: string
}
export type requestV3 = {
    headers: {
        'x-auth-token': string
    }
}

export type selectV3 = requestV3 & {
    body: requestBodySelectV3
}

export type sortAndFilter = {
    keyword?: string,
    name?: string,
    start?: number,
    limit?: number,
    order?: string,
}

export type selectOptions = {
    keyword?: string,
    name?: string,
    start?: number,
    limit?: number,
    order?: string
}