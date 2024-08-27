import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type get = {
    name: string,
    value: string
}
export async function get({res, connection}: typeGlobal.functions,{detail_code} : {detail_code: string}): Promise<get[]> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT
                            b.v_name AS name,
                            a.i_promotionnominal AS value
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        WHERE a.b_isactive = 1
                            AND a.fk_transactiondetail = ${detail_code}
                        ORDER BY a.i_code ASC`

        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotiondetail/get', resolve)
    })
}

export async function insertTransactionPromotionDetail (
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_transaction, fk_transactiondetail, fk_promotion, 
        promotion, promotionnominal, createdby, dt_created, test
    }   : {
            fk_business: number, fk_transaction: number, fk_transactiondetail: string,
            fk_promotion: number, promotion: number, promotionnominal: number,
            createdby: string, dt_created: string, test: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_transactionpromotiondetail (fk_business, fk_transaction, fk_transactiondetail, fk_promotion, i_promotion, i_promotionnominal, v_createdby, dt_created, v_test)
                    VALUES (${fk_business}, ${fk_transaction}, '${fk_transactiondetail}', ${fk_promotion}, ${promotion}, ${promotionnominal}, '${createdby}', '${dt_created}', '${test}')`

        functionGlobal.query(query, res, connection, 'function/transaction_promotiondetail/insertTransactionPromotionDetail', resolve)
    })
}

type getReportSalesComplete = {
    code: number,
    name: string,
    nominal: number,
    value: number,
    type: number,
    maximum_promotion: number,
    type_name: number
}
export async function getReportSalesComplete({res, connection}: typeGlobal.functions, {fk_transactiondetail}: {fk_transactiondetail: number}): Promise<Array<getReportSalesComplete>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_promotion AS code, 
                        CASE
                            WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', c.v_currency, ' ', FLOOR(a.i_promotion), ')')
                            WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', FLOOR(a.i_promotion), '%)')
                            ELSE b.v_name
                        END AS name,
                        a.i_promotionnominal AS nominal,
                        a.i_promotion AS value,
                        b.fk_systempromotion AS \`type\`,
                        b.i_maximum_promo AS \`maximum_promo\`,
                        d.v_name AS \`type_name\`
                    FROM dvw_transaction.vw_transactionpromotiondetail a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                    JOIN dvw_system.vw_promotion d ON b.fk_systempromotion = d.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_transactiondetail = ${fk_transactiondetail};`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotiondetail/getReportSalesComplete', resolve)
    })
}