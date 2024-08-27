export type broadcastContact = {
    code: string,
    name: string,
    phone: string,
    param_1?: string,
    param_2?: string,
    param_3?: string,
    param_4?: string,
    param_5?: string,
    param_6?: string,
    param_7?: string,
    param_8?: string,
    param_9?: string,
    param_10?: string,
    date_created: string,
}


export type get = {
    list: string
}


export type insert = {
    phone: string,
    list: string,
    name: string,
    wa: string,
    param?: []
}


export type update = {
    code: string,
    phone: string,
    list: string,
    name: string,
    wa: string,
    param?: []
}


export type updateParam = {
    code: string
    param?: []
}


export type del = {
    code: string
}