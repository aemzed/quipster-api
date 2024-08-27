export type shift = {
    code: number
}


export type checkShift = {
    count: number
}

export type getOpenClose = {
    open: string,
    close: string
}


export type insertCash = {
    business: string,
    user: string,
    type: string,
    value: string,
    notes?: string,
    date: string
}