import * as typeDuplicate from '../../type/duplicate'
import * as typeGlobal from '../../type/global'
import * as typePayment from '../../type/paymentmethod'
import * as functionGlobal from '../global_function'

type getDuplicateCount = {
    resultCount: number
}
export async function getDuplicateCount({res, connection, fk_business, dt_duplicate}: typeGlobal.functions & {fk_business: number, dt_duplicate: string}): Promise<getDuplicateCount> {
    return new Promise( async (resolve, reject) => {
        type queryResult = {
            sign: number,
            count: number
        }
        let query = `SELECT 
                        COUNT(0) AS "sign",
                        IFNULL(a.i_count, 0) AS "count"
                    FROM dvw_transaction.vw_duplicate a
                    WHERE a.fk_business = ${fk_business}
                        AND dt_duplicate = DATE('${dt_duplicate}')`
        let result: queryResult = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/duplicate/getDuplicateCount', resolve))
        resolve(<getDuplicateCount>{
            resultCount: result.count
        })
    })
}

export async function updateDuplicateCount({res, connection, dt_duplicate, count, fk_business} : typeGlobal.functions & {dt_duplicate: string, count: number, fk_business: number} ) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_transaction.vw_duplicate SET
                        dt_duplicate = DATE('${dt_duplicate}'),
                        i_count = ${count}
                    WHERE fk_business = ${fk_business}`
        
        functionGlobal.query(query, res, connection, 'function/duplicate/updateDuplicateCount', resolve)
    })
}