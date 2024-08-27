import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

type get = {
    code: string,
    receipt: string,
    customer: string,
    detail: string,
    date: string
}
export async function get<T extends get | get[]> ({res, connection}: typeGlobal.functions, {business, code="%"}: {business: number, code: string}): Promise<T> {
    var whereBusiness = ` a.fk_business = ${business}`;
    if(business == 7148 || business == 7150) whereBusiness = ` (a.fk_business = 7148 OR a.fk_business = 7150)`;
    if(business == 7151 || business == 7152) whereBusiness = ` (a.fk_business = 7151 OR a.fk_business = 7152)`;

    var whereCode = ` AND a.v_code LIKE '${code}'`;

    return new Promise((resolve, reject) => {
        let query = `   SELECT
                            a.v_code AS 'code',
                            a.v_receipt AS 'receipt',
                            a.v_customer AS 'customer',
                            a.v_detail AS 'detail',
                            a.dt_check_in AS 'date'
                        FROM dvw_transaction.vw_ticket a
                        WHERE ${whereBusiness}
                            ${whereCode}
                        ORDER BY dt_check_in DESC`
        
        if(code=="%") functionGlobal.query(query, res, connection, 'function/operational/ticket/get', resolve)
        else functionGlobal.querySingle(query, res, connection, 'function/operational/ticket/get', resolve)
    })
}

type getTicketDetail = {
    business: string,
    customer_name: string,
    detail: string
}
export function getTicketDetail({res, connection}: typeGlobal.functions, {receipt}: {receipt: string}): Promise<getTicketDetail> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.fk_business AS 'business',
                        b.v_name AS 'customer_name',
                        (
                            SELECT GROUP_CONCAT(CONCAT(ROUND(c.i_qty), 'x ', d.v_name) SEPARATOR '\n')
                            FROM dvw_transaction.vw_transactiondetail c
                            JOIN dvw_master.vw_item d ON c.fk_item = d.i_code
                            WHERE c.fk_transaction = a.i_code
                        ) AS 'detail',
                    FROM dvw_transaction.vw_transaction a
                    JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    WHERE a.s_offlinecode = '${receipt}'
                        AND a.b_isactive = 1
                        AND a.b_isvoid = 0`
        functionGlobal.querySingle(query, res, connection, 'function/operational/ticket/getTicketDetail', resolve)
    })
}

export function checkIn({res, connection}: typeGlobal.functions, {business, customer_name, receipt, detail} : {
    business: number,
    customer_name: string,
    receipt: string,
    detail: string
}): Promise<Omit<ResultSetHeader, "insertId"> & {
    insertId: string
}> {
    var hash = Date.now().toString(36) + Math.random().toString(36)

    return new Promise((resolve, reject) => {
        let query = `   INSERT INTO dvw_transaction.vw_ticket SET
                            v_code = '${hash}',
                            fk_business = ${business},
                            v_customer = '${customer_name}',
                            v_receipt = '${receipt}',
                            v_detail = '${detail}',
                            dt_check_in = NOW()`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/insert', resolve, {id: hash})
    })
}