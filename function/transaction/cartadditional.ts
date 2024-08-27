import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_cart, fk_cartdetail, fk_additional, price, qty, createdby,
        dt_created
    }   : {
            fk_business: number, fk_cart: number, fk_cartdetail: number,
            fk_additional: number, price: number, qty: number, createdby: string,
            dt_created: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_cartadditional (fk_business, fk_cart, fk_cartdetail, fk_additional, i_price, i_qty, v_createdby, dt_created)
                    VALUES (${fk_business}, ${fk_cart}, ${fk_cartdetail}, ${fk_additional}, ${price}, ${qty}, '${createdby}', '${dt_created}')`
        functionGlobal.query(query, res, connection, 'function/transaction/cartadditional/insert', resolve)
    })
}

type getQtyPrice = {
    qty: number,
    price: number
}
export function getQtyPrice({res, connection}: typeGlobal.functions, {fk_cartdetail}: {fk_cartdetail: number}): Promise<Array<getQtyPrice>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_qty AS 'qty',
                        a.i_price AS 'price'
                    FROM dvw_transaction.vw_cartadditional a
                    WHERE a.fk_cartdetail = ${fk_cartdetail}
                        AND a.b_isactive = 1`
        functionGlobal.query(query, res, connection, 'function/transaction/cartadditional/getQTYPrice', resolve)
    })
}