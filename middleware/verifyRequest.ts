import { NextFunction, Request, Response } from "express";

type requestBody = {
    transaction: {
        receipt: string,
        orderNumber: string,
        guest: string,
        server: string,
        date: string,
        customer_code: number,
        customer_name: string,
        salesType: string,
        tax: number,
        serviceCharge: number,
        items: Array<{
            code: string,
            price: string,
            qty: string,
            preferences: string,
            additional: Array<any>,
            promotion: Array<any>,
            isvoid?: string,
            dt_void?: string,
            void_by?: string,
            void_reason?: string,
            isprinted?: string,
            ispaid?: string,
            ispackage?: string,
            unit?: string
        }>
    }
}

export default async function (req: Request, res: Response, next: NextFunction) {
    
    const validator = {
        number: (data: any) => {
            return (typeof(data) === 'number' && !isNaN(data))
        },
        string: (data: any, allowEmpty: boolean = true) => {
            if (allowEmpty) return (typeof(data) === 'string')
            return (typeof(data) === 'string' && data !== '')
        }
    }

    if (req.body.transaction) {
        if (req.body.transaction.receipt) {
            if (validator.string(req.body.transaction.receipt, false)) return res.status(400).json({success: false, mesage: 'Kode nota harus diisi dan berupa string.'})
        }
        if (req.body.transaction.order_number) {
            req.body.transaction.order_number = parseFloat(req.body.transaction.order_number)
            if (isNaN(req.body.transaction.order_number)) return res.status(400).json({success: false, message: 'Nomor pesanan harus diisi'})
        }
    }
}