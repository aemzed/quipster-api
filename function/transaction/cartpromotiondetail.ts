import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { create } from "domain"

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_cart, fk_cartdetail, fk_promotion, promotion, 
        promotionnominal, createdby, dt_created
    }    : {
            fk_business: number, fk_cart: number, fk_cartdetail: number, fk_promotion: number,
            promotion: number, promotionnominal: number, createdby: string, dt_created: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_cartpromotiondetail (fk_business, fk_cart, fk_cartdetail, fk_promotion, i_promotion, i_promotionnominal, v_createdby, dt_created)
                    VALUES (${fk_business}, ${fk_cart}, ${fk_cartdetail}, ${fk_promotion}, ${promotion}, ${promotionnominal}, '${createdby}', '${dt_created}')`
        functionGlobal.query(query, res, connection, 'function/transaction/cartpromotiondetail/insert', resolve)
    })
}

type getPromotionNominal = {
    nominal: number
}
export function getPromotionNominal({res, connection}: typeGlobal.functions, {fk_cartdetail}: {fk_cartdetail: number}): Promise<Array<getPromotionNominal>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_promotionnominal AS 'nominal'
                    FROM dvw_transaction.vw_cartpromotiondetail a
                    WHERE a.fk_cartdetail = ${fk_cartdetail}
                        AND a.b_isactive = 1`
        functionGlobal.query(query, res, connection, 'function/transaction/cartpromotiondetail/getPromotionNominal', resolve)
    })
}