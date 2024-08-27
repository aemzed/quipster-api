export type broadcastPackage = {
    code: string,
    name: string,
    type: string,
    price: number,
    price_recurring: number,
    value: number,
    day: number
}


export type insert = {
    name: string, 
    type: string, 
    price: number, 
    price_recurring: number, 
    value: number,
    day: number
}


export type update = {
    business: string,
    code: string,
    name: string, 
    type: string, 
    price: number, 
    price_recurring: number, 
    value: number,
    day: number
}


export type del = {
    code: string
}