import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_cart, fk_promotion, promotion, promotionnominal, createdby,
        dt_created
    }   : {
            fk_business: number, fk_cart: number, fk_promotion: number,
            promotion: number, promotionnominal: number, createdby: string,
            dt_created: string
        } 
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_cartpromotion (fk_business, fk_cart, fk_promotion, i_promotion, i_promotionnominal, v_createdby, dt_created)
                VALUES (${fk_business}, ${fk_cart}, ${fk_promotion}, ${promotion}, ${promotionnominal}, '${createdby}', '${dt_created}')`
        functionGlobal.query(query, res, connection, 'function/transaction/cartpromotion/insert', resolve)
    })
}

type getNominal = {
    nominal: number
}
export function getNominal({res, connection}: typeGlobal.functions, {fk_cart}: {fk_cart: number}): Promise<Array<getNominal>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_promotionnominal AS 'nominal'
                    FROM dvw_transaction.vw_cartpromotion a
                    WHERE a.fk_cart = ${fk_cart}
                        AND a.b_isactive = 1`
        functionGlobal.query(query, res, connection, 'function/transaction/cartpromotion/getNominal', resolve)
    })
}