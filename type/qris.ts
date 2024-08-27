export type insert = {
    body: {
        hash: string,
        code?: string,
        amount: string,
        notes?: string,
        paymentMethodName?: string,
        fee: string,
        receipt: string,
        customerName?: string,
        customerPhone?: string
    }
}

export type check = {
    body: {
        hash: string,
        code: string,
        amount: string
    }
}