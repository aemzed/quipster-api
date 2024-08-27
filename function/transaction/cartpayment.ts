import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type getPayment = {
    paymentCode: number,
    paymentName: string,
    paymentInformation: string,
    paymentValue: number,
}
export async function getPayment ({res, connection}: typeGlobal.functions, {ordercode}: {ordercode: number}): Promise<Array<getPayment>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.fk_paymentmethod AS paymentCode,
                        b.v_name AS paymentName,
                        a.v_information AS paymentInformation,
                        a.i_paidmoney AS paymentValue
                    FROM dvw_transaction.vw_cartpayment a
                    JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                    WHERE a.fk_cart = ${ordercode}`
        functionGlobal.query(query, res, connection, 'function/transaction/cartpayment/getPayment', resolve)
    })
}

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_cart, fk_paymentmethod, paidmoney, information
    }   : {
            fk_business: number, fk_cart: number, fk_paymentmethod: number, paidmoney: number,
            information?: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_cartpayment (fk_business, fk_cart, fk_paymentmethod, i_paidmoney${information ? ', v_information' :  ''})
                    VALUES (${fk_business}, ${fk_cart}, ${fk_paymentmethod}, ${paidmoney}${information ? `, '${information}'` : ''})`
        functionGlobal.query(query, res, connection, 'function/transaction/cartpayment/insert', resolve)
    })
}