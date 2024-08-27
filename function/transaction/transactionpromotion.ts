import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type get = {
    name: string,
    value: number
}
export async function get({res, connection}: typeGlobal.functions,{receipt} : {receipt: string}): Promise<get[]> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT
                            b.v_promotionname AS name,
                            b.i_promotionnominal AS value
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactionpromotion b ON a.i_code = b.fk_transaction
                        WHERE a.s_offlinecode = '${receipt}'
                        ORDER BY b.i_code ASC`

        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/get', resolve)
    })
}

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_transaction, fk_promotion, promotion, 
        promotionnominal, promotionname, createdby, dt_created
    }   : {
            fk_business: number, fk_transaction: number, fk_promotion: string,
            promotion: number, promotionnominal: number, promotionname: string,
            createdby: string, dt_created: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_transactionpromotion (fk_business, fk_transaction, fk_promotion, i_promotion, i_promotionnominal, v_promotionname, v_createdby, dt_created)
                    VALUES (${fk_business}, ${fk_transaction}, '${fk_promotion}', '${promotion}', ${promotionnominal}, '${promotionname}', '${createdby}', '${dt_created}')`

        functionGlobal.query(query, res, connection, 'function/tranasctionpromotion/insert', resolve)
    })
}

export async function getReport({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}, {vw_transaction}: {vw_transaction: {dt_paid: {start_date: string, end_date: string}} }) {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM (
                        SELECT 
                            'Diskon Nota' AS 'discount_model',
                            c.v_name AS 'discount_name',
                            c.fk_systempromotion AS 'discount_type',
                            c.i_code AS 'discount_code',
                            a.i_promotion AS 'discount',
                            a.i_promotionnominal AS 'discount_nominal',
                            IF(c.fk_systempromotion = 3, (SELECT v_name FROM dvw_master.vw_item b WHERE b.i_code = v_value), '') as 'discount_product',
                            '' AS 'item',
                            b.s_offlinecode AS 'receipt',
                            b.dt_paid AS 'date',
                            b.v_paidby AS 'cashier'
                        FROM dvw_transaction.vw_transactionpromotion a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                        LEFT JOIN dvw_master.vw_promotion c ON a.fk_promotion = c.i_code
                        WHERE a.fk_business = ${fk_business}
                            AND b.b_isvoid = 0
                            AND b.b_isactive = 1
                            AND DATE(b.dt_paid) >= '${vw_transaction.dt_paid.start_date}'
                            AND DATE(b.dt_paid) <= '${vw_transaction.dt_paid.end_date}'
                        UNION ALL
                        SELECT 
                            'Diskon Produk' AS 'discount_model',
                            c.v_name AS 'discount_name',
                            c.fk_systempromotion AS 'discount_type',
                            c.i_code AS 'discount_code',
                            a.i_promotion AS 'discount',
                            a.i_promotionnominal * d.i_qty AS 'discount_nominal',
                            IF(c.fk_systempromotion = 3, (SELECT v_name FROM dvw_master.vw_item b WHERE b.i_code = v_value), '') as 'discount_product',
                            CASE
                                WHEN d.b_type = 1 THEN (SELECT CONCAT(z.v_name, ' - ', z.v_code) FROM dvw_master.vw_item z WHERE z.i_code = d.fk_item)
                                WHEN d.b_type = 1 THEN (SELECT CONCAT(z.v_name, ' - ', z.v_code) FROM dvw_master.vw_package z WHERE z.i_code = d.fk_item)
                            END AS 'item',
                            b.s_offlinecode AS 'receipt',
                            b.dt_paid AS 'date',
                            b.v_paidby AS 'cashier'
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                        LEFT JOIN dvw_master.vw_promotion c ON a.fk_promotion = c.i_code
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                        WHERE a.fk_business = ${fk_business}
                            AND b.b_isvoid = 0
                            AND d.b_isvoid = 0
                            AND b.b_isactive = 1
                            AND DATE(b.dt_paid) >= '${vw_transaction.dt_paid.start_date}'
                            AND DATE(b.dt_paid) <= '${vw_transaction.dt_paid.end_date}'
                    ) temp
                    ORDER BY 'date'`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/getReport', resolve)
    })
}

type getReportSalesDetail = {
    payment_method_code: number,
    payment_method_name: string,
    paid_money: string
}
export async function getReportSalesDetail({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSalesDetail>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_promotion AS \`code\`, 
                        b.v_name AS \`name\`,
                        a.i_promotionnominal AS \`nominal\`,
                        a.i_promotion AS \`value\`,
                        b.fk_systempromotion AS \`type\`,
                        b.i_maximum_promo AS \`maximum_promo\`,
                        c.v_name AS \`type_name\`
                    FROM dvw_transaction.vw_transactionpromotion a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    JOIN dvw_system.vw_promotion c ON b.fk_systempromotion = c.i_code
                    JOIN dvw_transaction.vw_transaction d ON a.fk_transaction = d.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_transaction = ${fk_transaction}`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/getReportSalesDetail', resolve)
    })
}

export async function getReportRevenue({res, connection}: typeGlobal.functions, {fk_business, vw_transaction, vw_customer}: {fk_business: number, vw_transaction: {dt_paid: {date_start: string, date_end: string}, v_paidby: string, v_createdby: string}, vw_customer: {v_name: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`system\`,
                        \`name\`,
                        SUM(\`total\`) AS \`total\`,
                        SUM(\`total_from_point\`) AS \`total_from_point\`,
                        SUM(\`total_from_complement\`) AS \`total_from_complement\`
                    FROM
                    (
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            CASE
                                WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), ')')
                                WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), '%)')
                                ELSE b.v_name
                            END AS \`name\`,
                            SUM(a.i_promotionnominal) AS \`total\`,
                            0 AS \`total_from_point\`,
                            0 AS \`total_from_complement\`
                        FROM dvw_transaction.vw_transactionpromotion a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        WHERE 
                            a.fk_business = ${fk_business}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion
                        UNION ALL
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            CASE
                                WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), ')')
                                WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), '%)')
                                ELSE b.v_name
                            END AS \`name\`,
                            SUM(a.i_promotionnominal*d.i_qty) AS \`total\`,
                            0 AS \`total_from_point\`,
                            0 AS \`total_from_complement\`
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        WHERE 
                            a.fk_business = ${fk_business}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND d.b_isactive = 1
                            AND d.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND(
                                b.fk_systempromotion = 1
                                OR
                                b.fk_systempromotion = 2
                            )
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion
                        UNION ALL
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            b.v_name AS \`name\`,
                            0 AS \`total\`,
                            0 AS \`total_from_point\`,
                            SUM(e.i_price * d.i_qty) AS \`total_from_complement\`
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                        JOIN dvw_master.vw_item e ON b.v_value = e.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        WHERE 
                            a.fk_business = ${fk_business}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND d.b_isactive = 1
                            AND d.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND b.fk_systempromotion = 3
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion
                        UNION ALL
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            CONCAT(b.v_name, ' (', e.v_name, ')') AS \`name\`,
                            0 AS \`total\`,
                            SUM(e.i_price * d.i_qty) AS \`total_from_point\`,
                            0 AS \`total_from_complement\`
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                        JOIN dvw_master.vw_item e ON d.fk_item = e.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        WHERE 
                            a.fk_business = ${fk_business}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND d.b_isactive = 1
                            AND d.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND b.fk_systempromotion = 4
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion, e.i_code
                    ) AS \`temp\`
                    GROUP BY \`temp\`.\`promotion\`, \`temp\`.\`name\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/getReportRevenue', resolve)
    })
}

export function getReportConsolidationRevenue({res, connection}: typeGlobal.functions, {vw_business, vw_transaction, vw_customer}: {vw_business: {fk_businessowner: number}, vw_transaction: {dt_paid: {date_start: string, date_end: string}, v_paidby: string, v_createdby: string}, vw_customer: {v_name: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`system\`,
                        \`name\`,
                        SUM(\`total\`) AS \`total\`
                    FROM
                    (
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            CASE
                                WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), ')')
                                WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), '%)')
                                ELSE b.v_name
                            END AS \`name\`,
                            SUM(a.i_promotionnominal) AS \`total\`
                        FROM dvw_transaction.vw_transactionpromotion a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        JOIN dvw_account.vw_business y ON a.fk_business = y.i_code
                        WHERE 
                            y.fk_businessowner = ${vw_business.fk_businessowner}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion
                        UNION ALL
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            CASE
                                WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), ')')
                                WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), '%)')
                                ELSE b.v_name
                            END AS \`name\`,
                            SUM(a.i_promotionnominal*d.i_qty) AS \`total\`
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        JOIN dvw_account.vw_business y ON a.fk_business = y.i_code
                        WHERE 
                            y.fk_businessowner = ${vw_business.fk_businessowner}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND d.b_isactive = 1
                            AND d.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND(
                                b.fk_systempromotion = 1
                                OR
                                b.fk_systempromotion = 2
                            )
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion
                        UNION ALL
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            b.v_name AS \`name\`,
                            SUM(e.i_price * d.i_qty) AS \`total\`
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                        JOIN dvw_master.vw_item e ON b.v_value = e.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        JOIN dvw_account.vw_business y ON a.fk_business = y.i_code
                        WHERE 
                            y.fk_businessowner = ${vw_business.fk_businessowner}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND d.b_isactive = 1
                            AND d.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND b.fk_systempromotion = 3
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion
                        UNION ALL
                        SELECT 
                            b.fk_systempromotion AS \`system\`,
                            a.fk_promotion AS \`promotion\`,
                            CONCAT(b.v_name, ' (', e.v_name, ')') AS \`name\`,
                            SUM(e.i_price * d.i_qty) AS \`total\`
                        FROM dvw_transaction.vw_transactionpromotiondetail a
                        JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                        JOIN dvw_master.vw_item e ON d.fk_item = e.i_code
                        LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                        JOIN dvw_account.vw_business y ON a.fk_business = y.i_code
                        WHERE 
                            y.fk_businessowner = ${vw_business.fk_businessowner}
                            AND c.b_isactive = 1
                            AND c.b_isvoid = 0
                            AND d.b_isactive = 1
                            AND d.b_isvoid = 0
                            AND c.b_ispaid = 1
                            AND b.fk_systempromotion = 4
                            AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            AND c.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND c.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND IFNULL(z.v_name,'') LIKE '${vw_customer.v_name}'
                        GROUP BY a.fk_promotion, a.i_promotion, e.i_code
                    ) AS \`temp\`
                    GROUP BY \`temp\`.\`promotion\`, \`temp\`.\`name\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/getReportConsolidationRevenue', resolve)
    })
}

export function getReportSpecialRevenue({res, connection}: typeGlobal.functions, {vw_business_user, vw_transaction}: {vw_business_user: {fk_user: number}, vw_transaction: {dt_paid: {date_start: string, date_end: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT \`system\`, \`name\`, SUM(\`total\`) AS \`total\`
                        FROM (
                            SELECT 
                                b.fk_systempromotion AS \`system\`,
                                a.fk_promotion AS \`promotion\`,
                                CASE
                                    WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), ')')
                                    WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), '%)')
                                    ELSE b.v_name
                                END AS \`name\`,
                                SUM(a.i_promotionnominal) AS \`total\`
                            FROM dvw_transaction.vw_transactionpromotion a
                            JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                            JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                            LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                            JOIN dvw_account.vw_business_user y ON a.fk_business = y.fk_business
                            WHERE 
                                y.fk_user = ${vw_business_user.fk_user}
                                AND c.b_isactive = 1
                                AND c.b_isvoid = 0
                                AND c.b_ispaid = 1
                                AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                                AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            GROUP BY a.fk_promotion, a.i_promotion
                            UNION ALL
                            SELECT 
                                b.fk_systempromotion AS \`system\`,
                                a.fk_promotion AS \`promotion\`,
                                CASE
                                    WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), ')')
                                    WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', TRIM(TRAILING '.00' FROM CAST(a.i_promotion AS CHAR)), '%)')
                                    ELSE b.v_name
                                END AS \`name\`,
                                SUM(a.i_promotionnominal*d.i_qty) AS \`total\`
                            FROM dvw_transaction.vw_transactionpromotiondetail a
                            JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                            JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                            JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                            LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                            JOIN dvw_account.vw_business_user y ON a.fk_business = y.fk_business
                            WHERE 
                                y.fk_user = ${vw_business_user.fk_user}
                                AND c.b_isactive = 1
                                AND c.b_isvoid = 0
                                AND d.b_isactive = 1
                                AND d.b_isvoid = 0
                                AND c.b_ispaid = 1
                                AND(
                                    b.fk_systempromotion = 1
                                    OR
                                    b.fk_systempromotion = 2
                                )
                                AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                                AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            UNION ALL
                            SELECT 
                                b.fk_systempromotion AS \`system\`,
                                a.fk_promotion AS \`promotion\`,
                                b.v_name AS \`name\`,
                                SUM(e.i_price * d.i_qty) AS \`total\`
                            FROM dvw_transaction.vw_transactionpromotiondetail a
                            JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                            JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                            JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                            JOIN dvw_master.vw_item e ON b.v_value = e.i_code
                            LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                            JOIN dvw_account.vw_business_user y ON a.fk_business = y.fk_business
                            WHERE 
                                y.fk_user = ${vw_business_user.fk_user}
                                AND c.b_isactive = 1
                                AND c.b_isvoid = 0
                                AND d.b_isactive = 1
                                AND d.b_isvoid = 0
                                AND c.b_ispaid = 1
                                AND b.fk_systempromotion = 3
                                AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                                AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            GROUP BY a.fk_promotion, a.i_promotion
                            UNION ALL
                            SELECT 
                                b.fk_systempromotion AS \`system\`,
                                a.fk_promotion AS \`promotion\`,
                                CONCAT(b.v_name, ' (', e.v_name, ')') AS \`name\`,
                                SUM(e.i_price * d.i_qty) AS \`total\`
                            FROM dvw_transaction.vw_transactionpromotiondetail a
                            JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                            JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                            JOIN dvw_transaction.vw_transactiondetail d ON a.fk_transactiondetail = d.i_code
                            JOIN dvw_master.vw_item e ON d.fk_item = e.i_code
                            LEFT JOIN dvw_master.vw_customer z ON c.fk_customer = z.i_code
                            JOIN dvw_account.vw_business_user y ON a.fk_business = y.fk_business
                            WHERE 
                                y.fk_user = ${vw_business_user.fk_user}
                                AND c.b_isactive = 1
                                AND c.b_isvoid = 0
                                AND d.b_isactive = 1
                                AND d.b_isvoid = 0
                                AND c.b_ispaid = 1
                                AND b.fk_systempromotion = 4
                                AND DATE(c.dt_paid) >= '${vw_transaction.dt_paid.date_start}'
                                AND DATE(c.dt_paid) <= '${vw_transaction.dt_paid.date_end}'
                            GROUP BY a.fk_promotion, a.i_promotion, e.i_code
                        ) AS \`temp\`
                        WHERE \`name\` IS NOT NULL
                        GROUP BY \`temp\`.\`promotion\`, \`temp\`.\`name\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/getReportSpecialRevenue', resolve)
    })
}

export function getReportSalesComplete({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_promotion AS \`code\`, 
                        b.v_name AS \`name\`,
                        a.i_promotion AS \`value\`,
                        a.i_promotionnominal AS \`nominal\`,
                        b.fk_systempromotion AS \`type\`,
                        c.v_name AS \`type_name\`
                    FROM dvw_transaction.vw_transactionpromotion a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    JOIN dvw_system.vw_promotion c ON b.fk_systempromotion = c.i_code
                    JOIN dvw_transaction.vw_transaction d ON a.fk_transaction = d.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_transaction = ${fk_transaction}`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/getReportSalesComplete', resolve)
    })
}

type getReportSalesProductDetailReceipt = {
    promotioncode: number,
    promotionname: string,
    promotion: number,
    promotionnominal: number,
    promotiontypecode: number,
    maximum_promotion: number,
    promotiontypename: string
}
export function getReportSalesProductDetailReceipt({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSalesProductDetailReceipt>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_promotion AS promotioncode, 
                        b.v_name AS promotionname,
                        a.i_promotion AS promotion,
                        a.i_promotionnominal AS promotionnominal,
                        b.fk_systempromotion AS promotiontypecode,
                        b.i_maximum_promo AS maximum_promotion,
                        c.v_name AS promotiontypename
                    FROM dvw_transaction.vw_transactionpromotion a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    JOIN dvw_system.vw_promotion c ON b.fk_systempromotion = c.i_code AND c.b_isactive=1
                    JOIN dvw_transaction.vw_transaction d ON a.fk_transaction = d.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_transaction = ${fk_transaction};`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpromotion/getReportSalesProductDetailReceipt', resolve)
    })
}