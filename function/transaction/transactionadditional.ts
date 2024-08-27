import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type get = {
    name: string,
    qty: string,
    price: string
}
export async function get({res, connection}: typeGlobal.functions,{detail_code} : {detail_code: string}): Promise<get[]> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT
                            b.v_name AS name,
                            a.i_qty AS qty,
                            a.i_price AS price
                        FROM dvw_transaction.vw_transactionadditional a
                        JOIN dvw_master.vw_additional b ON a.fk_additional = b.i_code
                        WHERE a.b_isactive = 1
                            AND a.fk_transactiondetail = ${detail_code}
                        ORDER BY a.i_code ASC`

        functionGlobal.query(query, res, connection, 'function/transaction/transactionadditional/get', resolve)
    })
}


export async function insertTransactionAdditional (
    {res, connection}: typeGlobal.functions, 
    {
        fk_business, fk_transaction, fk_transactiondetail, fk_additional,
        price, qty, createdby, dt_created
    }   : {
            fk_business: number, fk_transaction: number, fk_transactiondetail: string,
            fk_additional: number, price: number, qty: number, createdby: string,
            dt_created: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_transactionadditional(fk_business, fk_transaction, fk_transactiondetail, fk_additional, i_price, i_qty, v_createdby, dt_created)
                    VALUES (${fk_business}, ${fk_transaction}, '${fk_transactiondetail}', ${fk_additional}, ${price}, ${qty}, '${createdby}', '${dt_created}')`

        functionGlobal.query(query, res, connection, 'function/transaction_additional/insertTransactionAdditional', resolve)
    })
}

type getReportSalesAdditional = {
    code: number,
    additional: string,
    total: number,
    total_price: number,
    price: number,
    ordertaker: string
}
export async function getReportSalesAdditional ({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`code\`,
                        \`additional\`,
                        \`total\`,
                        \`price\`,
                        \`total_price\`,
                        \`ordertaker\`
                    FROM
                    (
                        SELECT
                            c.i_code AS \`code\`,
                            c.v_name AS \`additional\`,
                            SUM(a.i_qty * d.i_qty) AS \`total\`,
                            SUM(a.i_qty * d.i_qty * a.i_price) AS \`total_price\`,
                            a.i_price AS \`price\`,
                            b.v_createdby AS \`ordertaker\`
                        FROM dvw_transaction.vw_transactionadditional a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_additional c ON a.fk_additional = c.i_code AND c.b_isactive = 1
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code AND c.b_isactive = 1
                        WHERE b.fk_business = ${fk_business}
                            AND b.dt_paid >= '${dt_paid.date_start}'
                            AND b.dt_paid <= DATE_ADD('${dt_paid.date_end}', INTERVAL 1 DAY)
                        GROUP BY c.i_code, a.i_price
                    ) AS \`temp\`
                    ORDER BY additional DESC;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionadditional/getReportSalesAdditional', resolve)
    })
}

type getReportSalesComplete = {
    code: number,
    name: string,
    price: number,
    qty: number
}
export function getReportSalesComplete({res, connection}: typeGlobal.functions, {fk_transactiondetail}: {fk_transactiondetail: number}):Promise<Array<getReportSalesComplete>> {
    return new Promise((resolve, reject) => {
        let query = `	SELECT 
                            a.fk_additional AS code, 
                            b.v_name AS name,
                            a.i_price AS price,
                            a.i_qty AS qty
                        FROM dvw_transaction.vw_transactionadditional a
                        JOIN dvw_master.vw_additional b ON a.fk_additional = b.i_code
                        WHERE a.b_isactive = 1
                            AND a.fk_transactiondetail = ${fk_transactiondetail};`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionadditional/getReportSalesComplete', resolve)
    })
}

type getReportShiftOtherDetail = {
    total_sales_additional: string,
    total_promotion: string,
    tax: string,
    sc: string,
    rounded: string
}
export function getReportShiftOtherDetail({res, connection}: typeGlobal.functions, {fk_business, dt_paid, v_paidby}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, v_paidby: string}): Promise<getReportShiftOtherDetail> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional\`,
                        IFNULL(SUM(\`total_promotion\`),0) AS \`total_promotion\`,
                        IFNULL(SUM(\`tax\`),0) AS \`tax\`,
                        IFNULL(SUM(\`sc\`) + SUM(\`rounded\`),0) AS \`sc\`,
                        IFNULL(SUM(\`rounded\`),0) AS \`rounded\`
                    FROM
                    (
                        SELECT
                            IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional\`,
                            IFNULL(SUM(\`total_promotion\`),0) + IFNULL(y.i_promotionnominal,0) AS \`total_promotion\`,
                            IFNULL(z.i_vatnominal,0) AS \`tax\`,
                            IFNULL(z.i_scnominal,0) AS \`sc\`,
                            IFNULL(z.i_rounded,0) AS \`rounded\`
                        FROM
                        (
                            SELECT 
                                (
                                    SELECT SUM(z.i_price * z.i_qty * c.i_qty)
                                    FROM dvw_transaction.vw_transactionadditional z
                                    WHERE z.fk_transactiondetail = c.i_code
                                    GROUP BY z.fk_transactiondetail
                                ) AS \`total_sales_additional\`,
                                SUM(IFNULL(g.i_promotionnominal,0) * c.i_qty) AS \`total_promotion\`,
                                a.i_code AS \`code\`
                            FROM dvw_transaction.vw_transaction a
                            LEFT JOIN dvw_transaction.vw_transactiondetail c ON a.i_code = c.fk_transaction AND c.b_isactive = 1 AND c.b_isvoid = 0
                            LEFT JOIN dvw_transaction.vw_transactionpromotiondetail g ON c.i_code = g.fk_transactiondetail
                            LEFT JOIN dvw_master.vw_promotion h ON g.fk_promotion = h.i_code
                            WHERE
                                a.fk_business = ${fk_business}
                                AND a.v_paidby LIKE '${v_paidby}'
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                                AND a.b_ispaid = 1
                                AND a.b_isactive = 1
                                AND a.b_isvoid = 0
                            GROUP BY c.i_code
                        ) AS temp
                        JOIN dvw_transaction.vw_transaction z ON temp.code = z.i_code
                        LEFT JOIN dvw_transaction.vw_transactionpromotion y ON temp.code = y.fk_transaction
                        JOIN dvw_account.vw_business h ON z.fk_business = h.i_code
                        GROUP BY z.i_code
                    ) AS temp1;
                    `
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transactionadditional/getReportShiftOtherDetail', resolve)
    })
}