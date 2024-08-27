export type broadcastList = {
    code: string,
    name: string,
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
    description: string,
    total_contact: number,
    date_created: string,
}

export type insert = {
    phone: string,
    name: string,
    description: string,
    param?: []
}

export type update = {
    phone: string,
    code: string,
    name: string,
    description: string,
    param: []
}

export type del = {
    phone: string,
    code: string
}