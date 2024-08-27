export type getStore = {
    store: string
}

export type getKeyword = {
    keyword: string
}

export type getByPhone = {
    phone: string
}

export type getByReceipt = {
    receipt: string
}

export type banner = {
    name: string,
    banner: string
}

export type voucher = {
    code: string,
    name: string,
    product_sku: string,
    product_name: string,
    price: string,
    price_sale: string,
    date_start_sale: string,
    date_end_sale: string
}

export type store = {
    code: string,
    name: string,
    address: string,
    city: string,
    phone: number,
    latitude: number,
    longitude: number,
    sunday: number,
    monday: number,
    tuesday: number,
    wednesday: number,
    thursday: number,
    friday: number,
    saturday: number,
    banner: number,
}

export type product = {
    name: string,
    sku: string,
    photo: string,
    category: string,
    price: number,
    qty: number,
}

export type productKeyword = {
    name: string,
    sku: string,
    photo: string,
    category: string,
    price: number,
    qty: number,
    store_name: string,
    store_latitude: number,
    store_longitude: number,
    store_city: string,
    store_sunday: string,
    store_monday: string,
    store_tuesday: string,
    store_wednesday: string,
    store_thursday: string,
    store_friday: string,
    store_saturday: string,
}