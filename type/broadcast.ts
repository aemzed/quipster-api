export type onlyPhone = {
    phone: string
}

export type getUserPackage = {
    phone: string
}

export type responseUserPackage = {
    code: string,
    type: string,
    number: string,
    max_send: number,
    api_key: string,
    number_key: string,
    credit: number,
    credit_full: number
}

export type getUserCredit = {
    phone: string,
    package: string
}

export type getTransactionHistory = {
    phone: string
}

export type responseUserCredit = {
    credit: number,
    credit_full: number,
    date_expiration: string
}



export type buyPackage = {
    phone: string,
    number: string,
    package: string,
    price: string
}

export type responseBuyPackage = {
    qr_string: string,
    hash: string
}









export type getOtp = {
    body: {
        phone: string
    }
}


export type submitOtp = {
    body: {
        phone: string,
        otp: string
    }
}



export type completeData = {
    body: {
        phone: string,
        name: string,
        referral: string
    }
}


export type getList = {
    phone: string,
    code?: string
}


export type insertList = {
    body: {
        phone: string,
        name: string,
        description: string,
        param: []
    }
}


export type updateListParam = {
    body: {
        code: string
        param: []
    }
}