import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type get = {
    code: string,
    name: string,
    qty: string,
    price: string,
    notes: string,
    void_status: string,
    additional?: any,
    promotion?: any
}
export async function get({res, connection}: typeGlobal.functions,{receipt} : {receipt: string}): Promise<get[]> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT
                            b.i_code AS code,
                            CASE
                                WHEN b.b_type = 1 THEN (SELECT z.v_name FROM dvw_master.vw_item z WHERE z.i_code = b.fk_item)
                                WHEN b.b_type = 2 THEN (SELECT z.v_name FROM dvw_master.vw_package z WHERE z.i_code = b.fk_item)
                            END AS name,
                            b.i_qty AS qty,
                            b.i_price AS price,
                            b.v_preference AS notes,
                            b.b_isvoid AS void_status
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactiondetail b ON a.i_code = b.fk_transaction
                        WHERE b.b_isactive = 1
                            AND a.s_offlinecode = '${receipt}'
                        ORDER BY b.i_code ASC`

        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/get', resolve)
    })
}



type insertTransactionDetail = {
    insertId: string
}
export async function insertTransactionDetail(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_transaction, fk_item, fk_unit, qty, price,
        preference, createdby, dt_created, paidby, isvoid, dt_void,
        voidby, isprinted, type, ispaid, voidreason
    }   : {
            fk_business: number, fk_transaction: number, fk_item: number,
            fk_unit: number, qty: number, price: number, preference: string,
            createdby: string, dt_created: string, paidby: string,
            isvoid: number, dt_void: string, voidby: string, isprinted: number,
            type: number, ispaid: number, voidreason: string
        }
): Promise<insertTransactionDetail> {
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            insertId: string
        }
        let query = `INSERT INTO dvw_transaction.vw_transactiondetail (fk_business, fk_transaction, fk_item, fk_unit, i_qty, i_price, v_preference, v_createdby, dt_created, v_paidby, b_isvoid, dt_void, v_voidby, b_isprinted, b_type, b_ispaid, v_voidreason)
                    VALUES (${fk_business}, ${fk_transaction}, ${fk_item}, ${fk_unit}, ${qty}, ${price}, '${preference}', '${createdby}', '${dt_created}', '${paidby}', ${isvoid}, '${dt_void}', '${voidby}', ${isprinted}, ${type}, ${ispaid}, '${voidreason}')`

        let result: queryResult = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/transaction_detail/insertTransactionDetail', resolve))
        resolve(<insertTransactionDetail>{
            insertId: result.insertId
        })
    })
}

export async function insertTransactionDetailForPackage(
    {res, connection}: typeGlobal.functions, 
    {
        fk_business, fk_transaction, createdby, dt_created, paidby, 
        isvoid
    }   : {
            fk_business: number, fk_transaction: number, createdby: string,
            dt_created: string, paidby: string, isvoid: number
        }
) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                    ${fk_business},
                    ${fk_transaction},
                    a.fk_item,
                    a.i_qty * :itemqty,
                    0,
                    '',
                    '${createdby}',
                    '${dt_created}',
                    '${paidby}',
                    ${isvoid},
                    3
                FROM dvw_master.vw_packagedetail a
                WHERE a.fk_package = :itemcode
                AND a.b_isactive = 1`

        functionGlobal.query(query, res, connection, 'function/transaction_detail/insertTransactionDetailForPackage', resolve)
    })
}

type reportShiftProductsales = {
    code: string,
    category: string,
    item: string,
    total: number,
    total_price: number,
    category_code: number
}
export async function reportShiftProduct({res, connection}: typeGlobal.functions, {fk_business, dt_paid, paidby}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, paidby: string}): Promise<Array<reportShiftProductsales>> {
    if(fk_business == 57 || fk_business == 5546) paidby = "%"

    return new Promise((resolve, reject) => {
        let query = `   SELECT
                            c.v_code AS "code",
                            d.v_name AS "category",
                            c.v_name AS "name",
                            SUM(a.i_qty) AS "qty",
                            SUM(a.i_qty * a.i_price) AS "total",
                            d.i_code AS "category_code"
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                        LEFT JOIN dvw_master.vw_category d ON c.fk_category = d.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND a.b_type = 1
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${paidby}'
                        GROUP BY c.i_code
                        UNION ALL
                        SELECT
                            c.v_code AS "code",
                            'Package' AS "category",
                            c.v_name AS "item",
                            SUM(a.i_qty) AS "total",
                            SUM(a.i_qty * a.i_price) AS "total_price",
                            0 AS "category_code"
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_package c ON a.fk_item = c.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND a.b_type = 2
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${paidby}'
                        GROUP BY c.i_code
                    ORDER BY category_code, name`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/reportShiftProductsales', resolve)
    })
}

type reportShiftProductsalesVoid = {
    code: string,
    category: string,
    item: string,
    total: number,
    total_price: number,
    category_code: number
}
export async function reportShiftProductVoid ({res, connection}: typeGlobal.functions, {fk_business, dt_paid, paidby}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, paidby: string}): Promise<Array<reportShiftProductsalesVoid>> {
    if(fk_business == 57 || fk_business == 5546) paidby = "%"
    
    return new Promise((resolve, reject) => {
        let query = `   SELECT
                            c.v_code AS "code",
                            d.v_name AS "category",
                            c.v_name AS "name",
                            SUM(a.i_qty) AS "qty",
                            SUM(a.i_qty * a.i_price) AS "total",
                            d.i_code AS "category_code"
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1
                        JOIN dvw_master.vw_item c ON a.fk_item = c.i_code AND c.b_isactive = 1
                        LEFT JOIN dvw_master.vw_category d ON c.fk_category = d.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND (a.b_isvoid = 1 OR b.b_isvoid = 1)
                            AND a.b_type = 1
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${paidby}'
                        GROUP BY c.i_code
                        UNION ALL
                        SELECT
                            c.v_code AS "code",
                            'Package' AS "category",
                            c.v_name AS "name",
                            SUM(a.i_qty) AS "qty",
                            SUM(a.i_qty * a.i_price) AS "total",
                            0 AS "category_code"
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1
                        JOIN dvw_master.vw_package c ON a.fk_item = c.i_code AND c.b_isactive = 1
                        WHERE b.fk_business = ${fk_business}
                            AND (a.b_isvoid = 1 OR b.b_isvoid = 1)
                            AND a.b_type = 2
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${paidby}'
                        GROUP BY c.i_code
                    ORDER BY category_code, name`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/reportShiftProductsalesVoid', resolve)
    })
}

export function getCategorySummary({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {start_date: string, end_date: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        d.v_name AS "category",
                        SUM(a.i_qty) AS "total_qty",
                        SUM((a.i_price - IFNULL(e.i_promotionnominal,0)) * a.i_qty) AS "total_amount"
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                    JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                    JOIN dvw_master.vw_category d ON c.fk_category = d.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON a.i_code  = e.fk_transactiondetail
                    WHERE b.fk_business = ${fk_business}
                        AND a.b_type = 1
                        AND a.b_isvoid = 0
                        AND b.b_isvoid = 0
                        AND a.b_isactive = 1
                        AND b.b_isactive = 1
                        AND b.dt_paid >= '${dt_paid.start_date}'
                        AND b.dt_paid <= DATE_ADD('${dt_paid.end_date}', INTERVAL 1 DAY)
                    GROUP BY d.i_code;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getCategorySummary', resolve)
    })
}

type getDayReportHPP = {
    total_hpp: number
}
export function getDayReportHPP({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {selected_date: string}}): Promise<getDayReportHPP> {
    return new Promise((resolve, reject) => {
        let query = `SELECT IFNULL(SUM(z.i_qty * z.i_pricenet),0) AS 'total_hpp'
                    FROM dvw_transaction.vw_transactiondetail z
                    JOIN dvw_transaction.vw_transaction y ON z.fk_transaction = y.i_code AND DATE(y.dt_paid) = '${dt_paid.selected_date}' AND y.b_isvoid = 0 AND y.b_isactive = 1
                    WHERE z.b_isactive = 1
                        AND z.b_isvoid = 0
                        AND y.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transactiondetail/getDayReport', resolve)
    })
}

type getDayReportQTY = {
    total_qty: number
}
export function getDayReportQTY({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {selected_date: string}}): Promise<getDayReportQTY> {
    return new Promise((resolve, reject) => {
        let query = `SELECT IFNULL(SUM(z.i_qty),0) AS 'total_qty'
                    FROM dvw_transaction.vw_transactiondetail z
                    JOIN dvw_transaction.vw_transaction y ON z.fk_transaction = y.i_code AND DATE(y.dt_paid) = '${dt_paid.selected_date}' AND y.b_isvoid = 0 AND y.b_isactive = 1
                    WHERE z.b_isactive = 1
                        AND z.b_isvoid = 0
                        AND y.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transactiondetail/getDayReport', resolve)
    })
}

type getProfitSharingV3 = {
    item_code: number,
    item_name: string,
    profit_sharing_name: string,
    profit_sharing_nominal: number,
    business_name: string
}
export function getProfitSharingBusinessV3({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {start_date: string, end_date: string}}): Promise<Array<getProfitSharingV3>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_item AS \`item_code\`,
                        c.v_name AS \`item_name\`,
                        a.v_profit_sharing_name AS \`profit_sharing_name\`,
                        SUM(a.i_profit_sharing) AS \`profit_sharing_nominal\`,
                        d.v_name AS \`business_name\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                    JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                    JOIN dvw_account.vw_business d ON b.fk_business = d.i_code
                    WHERE b.fk_business = ${fk_business}
                        AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${dt_paid.start_date}'
                        AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${dt_paid.end_date}'
                        AND a.v_profit_sharing_name <> ''
                        AND a.i_profit_sharing > 0
                        AND a.b_isvoid = 0
                        AND b.b_isvoid = 0
                    GROUP BY a.fk_item, a.v_profit_sharing_name;`
        functionGlobal.query(query, res, connection, "function/transaction/transactiondetail/ getProfitSharingV3", resolve)
    })
}

export function getProfitSharingBusinessOwnerV3({res, connection}: typeGlobal.functions, {fk_businessowner, dt_paid}: {fk_businessowner: number, dt_paid: {start_date: string, end_date: string}}): Promise<Array<getProfitSharingV3>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_item AS \`item_code\`,
                        c.v_name AS \`item_name\`,
                        a.v_profit_sharing_name AS \`profit_sharing_name\`,
                        SUM(a.i_profit_sharing) AS \`profit_sharing_nominal\`,
                        d.v_name AS \`business_name\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                    JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                    JOIN dvw_account.vw_business d ON b.fk_business = d.i_code
                    WHERE d.fk_businessowner = ${fk_businessowner}
                        AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${dt_paid.start_date}'
                        AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${dt_paid.end_date}'
                        AND a.v_profit_sharing_name <> ''
                        AND a.i_profit_sharing > 0
                        AND a.b_isvoid = 0
                        AND b.b_isvoid = 0
                    GROUP BY a.fk_item, a.v_profit_sharing_name;`
        functionGlobal.query(query, res, connection, "function/transaction/transactiondetail/ getProfitSharingV3", resolve)
    })
}

export function getProfitSharingUserV3({res, connection}: typeGlobal.functions, {fk_user, dt_paid}: {fk_user: number, dt_paid: {start_date: string, end_date: string}}): Promise<Array<getProfitSharingV3>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_item AS \`item_code\`,
                        c.v_name AS \`item_name\`,
                        a.v_profit_sharing_name AS \`profit_sharing_name\`,
                        SUM(a.i_profit_sharing) AS \`profit_sharing_nominal\`,
                        e.v_name AS \`business_name\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                    JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                    JOIN dvw_account.vw_business_user d ON b.fk_business = d.fk_business
                    JOIN dvw_account.vw_business e ON b.fk_business = e.i_code
                    WHERE d.fk_user = ${fk_user}
                        AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${dt_paid.start_date}'
                        AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${dt_paid.end_date}'
                        AND a.v_profit_sharing_name <> ''
                        AND a.i_profit_sharing > 0
                        AND a.b_isvoid = 0
                        AND b.b_isvoid = 0
                    GROUP BY a.fk_item, a.v_profit_sharing_name;`
        functionGlobal.query(query, res, connection, "function/transaction/transactiondetail/ getProfitSharingV3", resolve)
    })
}
type getReportProfitSharingDetail = {
    item_code: number,
    item_name: string,
    profit_sharing_name: string,
    profit_sharing_nominal: number,
    business_name: string,
    date: string,
    receipt: string
}
export function getReportProfitSharingDetail({res, connection}: typeGlobal.functions, {fk_item}: {fk_item: number}, {vw_transaction}: {vw_transaction: {dt_paid: {start_date: string, end_date: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                    a.fk_item AS \`item_code\`,
                    c.v_name AS \`item_name\`,
                    a.v_profit_sharing_name AS \`profit_sharing_name\`,
                    a.i_profit_sharing AS \`profit_sharing_nominal\`,
                    d.v_name AS \`business_name\`,
                    b.dt_paid AS \`date\`,
                    b.s_offlinecode AS \`receipt\`
                FROM dvw_transaction.vw_transactiondetail a
                JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                JOIN dvw_account.vw_business d ON b.fk_business = d.i_code
                WHERE DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.start_date}'
                    AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.end_date}'
                    AND a.v_profit_sharing_name <> ''
                    AND a.i_profit_sharing > 0
                    AND a.fk_item = ${fk_item}
                    AND a.b_isvoid = 0
                    AND b.b_isvoid = 0;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getProfitSharingDetailV3', resolve)
    })
}

export function getReportSalesCustomer({res, connection}: typeGlobal.functions, {vw_transaction, vw_customer}: {vw_transaction: {fk_business: number, dt_paid: {date_start: string, date_end: string}}, vw_customer: {name: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`code\`,
                        \`customer\`,
                        SUM(\`total\`) AS \`total\`,
                        SUM(\`total_price\`) AS \`total_price\`,
                        SUM(\`totalnet\`) AS \`total_hpp\`,
                        SUM(\`totalpromotion\`) AS \`total_promotion\`,
                        SUM(\`tax\`) AS \`total_tax\`,
                        SUM(\`sc\`) AS \`total_service_charge\`,
                        (
                            SELECT
                                    \`most\`
                                FROM
                                (
                                    SELECT 
                                        g.i_code AS \`item\`,
                                        g.v_name AS \`most\`,
                                        SUM(e.i_qty) AS \`qty\`,
                                        f.fk_customer AS \`customer\`
                                    FROM dvw_transaction.vw_transactiondetail e
                                    JOIN dvw_transaction.vw_transaction f ON e.fk_transaction = f.i_code AND f.b_ispaid = 1 AND f.b_isactive = 1 AND f.b_isvoid = 0
                                    JOIN dvw_master.vw_item g ON e.fk_item = g.i_code
                                    WHERE f.fk_business = ${vw_transaction.fk_business}
                                        AND DATE_FORMAT(f.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                                        AND DATE_FORMAT(f.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                                        AND e.b_type = 1
                                    GROUP BY g.i_code, f.fk_customer
                                    UNION ALL
                                    SELECT 
                                        g.i_code AS \`item\`,
                                        g.v_name AS \`most\`,
                                        SUM(e.i_qty) AS \`qty\`,
                                        f.fk_customer AS \`customer\`
                                    FROM dvw_transaction.vw_transactiondetail e
                                    JOIN dvw_transaction.vw_transaction f ON e.fk_transaction = f.i_code AND f.b_ispaid = 1 AND f.b_isactive = 1 AND f.b_isvoid = 0
                                    JOIN dvw_master.vw_package g ON e.fk_item = g.i_code
                                    WHERE f.fk_business = ${vw_transaction.fk_business}
                                        AND DATE_FORMAT(f.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                                        AND DATE_FORMAT(f.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                                        AND e.b_type = 2
                                    GROUP BY g.i_code, f.\`fk_customer\`
                                ) AS temp
                                WHERE \`customer\` = temp.fk_customer
                                ORDER BY \`qty\` DESC
                                LIMIT 1
                        ) AS \`most_purchased_item\`
                    FROM
                    (
                        SELECT
                            b.fk_customer AS \`fk_customer\`,
                            d.v_code AS \`code\`,
                            d.v_name AS \`customer\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            b.i_totalnet AS \`totalnet\`,
                            b.i_totalpromotion AS \`totalpromotion\`,
                            b.i_vatnominal AS \`tax\`,
                            b.i_scnominal AS \`sc\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0 AND b.fk_customer <> 0
                        JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                        JOIN dvw_master.vw_customer d ON b.fk_customer = d.i_code
                        WHERE b.fk_business = ${vw_transaction.fk_business}
                            ${vw_customer.name ? 
                            `AND TRIM(d.v_name) LIKE TRIM('${vw_customer.name}')`
                            : ``}
                            AND
                            (
                                a.b_type = 1
                                OR a.b_type = 2
                            )
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                        GROUP BY b.i_code
                    ) AS temp
                    GROUP BY \`fk_customer\`
                    ORDER BY \`customer\` ASC;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesCustomer', resolve)
    })
}

export async function getReportSalesCustomerProduct({res, connection}: typeGlobal.functions, {vw_transaction, vw_customer}: {vw_transaction: {fk_business: number, dt_paid: {date_start: string, date_end: string}}, vw_customer: {code: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        b.i_code AS \`product_code\`,
                        a.b_type AS \`type\`,
                        b.v_code AS \`sku\`,
                        b.v_name AS \`product_name_short\`,
                        CASE
                            WHEN a.fk_unit = b.fk_unit AND f.v_name IS NULL THEN b.v_name
                            WHEN a.fk_unit <> b.fk_unit THEN CONCAT(b.v_name, ' (', g.v_name, ')')
                            WHEN f.v_name IS NOT NULL THEN CONCAT(b.v_name, ' (', f.v_name, ')')
                            ELSE CONCAT(b.v_name, ' (', g.v_name, ')', ' (', f.v_name, ')')
                        END AS \`product_name\`,
                        IFNULL(e.fk_promotion, 0) AS \`promotion\`,
                        a.i_price AS \`price\`,
                        SUM(a.i_qty) AS \`qty\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                    JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                    JOIN dvw_master.vw_customer d ON c.fk_customer = d.i_code AND d.b_isactive = 1
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON a.i_code  = e.fk_transactiondetail
                    LEFT JOIN dvw_master.vw_promotion f ON e.fk_promotion = f.i_code
                    LEFT JOIN dvw_master.vw_unit g ON a.fk_unit = g.i_code
                    WHERE a.b_isactive = 1
                        AND a.b_type = 1
                        AND c.fk_business = ${vw_transaction.fk_business}
                        ${vw_customer.code ?
                        `AND d.v_code = '${vw_customer.code}'`
                        : ``}
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                        AND a.b_isvoid = 0
                        AND c.b_isvoid = 0
                    GROUP BY b.v_code, a.i_price, IFNULL(e.fk_promotion,0), IFNULL(e.i_promotionnominal,0)
                    UNION ALL
                    SELECT 
                        b.i_code AS \`product_code\`,
                        a.b_type AS \`type\`,
                        b.v_code AS \`sku\`,
                        b.v_name AS \`product_name_short\`,
                        CASE
                            WHEN f.v_name IS NULL THEN b.v_name
                            ELSE CONCAT(b.v_name, ' (', f.v_name, ')')
                        END AS \`product_name\`,
                        IFNULL(e.fk_promotion, 0) AS \`promotion\`,
                        a.i_price AS \`price\`,
                        SUM(a.i_qty) AS \`qty\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_master.vw_package b ON a.fk_item = b.i_code
                    JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                    JOIN dvw_master.vw_customer d ON c.fk_customer = d.i_code AND d.b_isactive = 1
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON a.i_code  = e.fk_transactiondetail
                    LEFT JOIN dvw_master.vw_promotion f ON e.fk_promotion = f.i_code
                    LEFT JOIN dvw_master.vw_unit g ON a.fk_unit = g.i_code
                    WHERE a.b_isactive = 1
                        AND a.b_type = 2
                        AND c.fk_business = ${vw_transaction.fk_business}
                        ${vw_customer.code ?
                        `AND d.v_code = '${vw_customer.code}'`
                        : ``}
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                        AND a.b_isvoid = 0
                        AND c.b_isvoid = 0
                    GROUP BY b.v_code, a.i_price, IFNULL(e.fk_promotion,0), IFNULL(e.i_promotionnominal,0);`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesCustomerProduct', resolve)
    })
}

type getReportSalesCustomerDetail = {
    date: string,
    qty: number,
    notes: string,
    receipt: string,
    customer: string,
    guest: string,
    price: number
}
export function getReportSalesCustomerDetail({res, connection}: typeGlobal.functions, {type, fk_item, price, vw_transaction, vw_customer, vw_transactionpromotiondetail}: {type: number, price: number, fk_item: number, vw_transaction: {fk_business: number, dt_paid: {date_start: string, date_end: string}}, vw_customer: {code: string}, vw_transactionpromotiondetail: {fk_promotion: number}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        c.dt_paid AS \`date\`,
                        SUM(a.i_qty) AS \`qty\`,
                        a.v_preference AS \`notes\`,
                        c.s_offlinecode AS \`receipt\`,
                        IFNULL(d.v_name, '') AS \`customer\`,
                        IFNULL(c.v_guest, '') AS \`guest\`,
                        a.i_price AS \`price\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                    LEFT JOIN dvw_master.vw_customer d ON c.fk_customer = d.i_code AND d.b_isactive = 1
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON e.fk_transactiondetail = a.i_code AND e.b_isactive = 1
                    WHERE a.b_isactive = 1
                        AND c.b_isactive = 1
                        AND a.b_type = ${type}
                        AND c.fk_business = ${vw_transaction.fk_business}
                        AND a.fk_item = ${fk_item}
                        AND IFNULL(d.v_code, '') LIKE '${vw_customer.code}'
                        AND a.i_price LIKE '${price}'
                        AND IFNULL(e.fk_promotion,0) LIKE '${vw_transactionpromotiondetail.fk_promotion}'
                        AND a.b_isvoid = 0
                        AND c.b_isvoid = 0
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                    GROUP BY a.dt_created, a.v_preference;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesCustomerDetail', resolve)
    })
}

type getReportSalesDetail = {
    detail_code: string, 
    item_code: string, 
    sku: string, 
    item_name: string, 
    price: string, 
    hpp: string, 
    margin: string, 
    qty: string, 
    unit_code: string, 
    unit_name: string, 
    notes: string, 
    void_status: string, 
    void_reason: string, 
    has_stock: string, 
    has_formula: string, 
    is_package: string, 
    category_pph: string, 
    category_code: string, 
    category_name: string
}
export async function getReportSalesDetail({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSalesDetail>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM (
                        SELECT 
                            a.i_code AS \`detail_code\`,
                            a.fk_item AS \`item_code\`, 
                            b.v_code AS \`sku\`,
                            b.v_name AS \`item_name\`,
                            a.i_price AS \`price\`,
                            a.i_pricenet AS \`hpp\`,
                            (a.i_price - a.i_pricenet) / a.i_pricenet * 100 AS \`margin\`,
                            a.i_qty AS \`qty\`,
                            a.fk_unit AS \`unit_code\`,
                            d.v_name AS \`unit_name\`,
                            a.v_preference AS \`notes\`,
                            a.b_isvoid AS \`void_status\`,
                            a.v_voidreason AS \`void_reason\`,
                            b.b_hasstock AS \`has_stock\`,
                            b.b_hasformula AS \`has_formula\`,
                            0 AS \`is_package\`,
                            a.d_pph AS \`category_pph\`,
                            c.i_code AS \`category_code\`,
                            c.v_name AS \`category_name\`,
                            '' AS detail
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                        JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                        JOIN dvw_master.vw_unit d ON b.fk_unit = d.i_code
                        WHERE a.b_isactive = 1
                            AND a.b_type = 1
                            AND a.fk_transaction = "${fk_transaction}"
                        UNION ALL
                            SELECT 
                            d.i_code AS \`detail_code\`,
                            d.fk_item AS \`item_code\`, 
                            e.v_code AS \`sku\`,
                            e.v_name AS \`item_name\`,
                            d.i_price AS \`price\`,
                            d.i_pricenet AS \`hpp\`,
                            (d.i_price - d.i_pricenet) / d.i_pricenet * 100 AS \`margin\`,
                            d.i_qty AS \`qty\`,
                            0 AS \`unit_code\`,
                            'Pcs' AS \`unit_name\`,
                            d.v_preference AS \`notes\`,
                            d.b_isvoid AS \`void_status\`,
                            d.v_voidreason AS \`void_reason\`,
                            IFNULL((
                                SELECT MAX(b.b_hasstock)
                                FROM dvw_master.vw_packagedetail a
                                JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                                WHERE a.fk_package = e.i_code
                                    AND a.b_isactive = 1
                            ),0) AS \`has_stock\`,
                            IFNULL((
                                SELECT MAX(b.b_hasformula)
                                FROM dvw_master.vw_packagedetail a
                                JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                                WHERE a.fk_package = e.i_code
                                AND a.b_isactive = 1
                            ),0) AS \`has_formula\`,
                            1 AS \`is_package\`,
                            0 AS \`category_pph\`,
                            'Paket' AS \`category_name\`,
                            '-1' AS \`category_code\`,
                            (
                                SELECT GROUP_CONCAT(DISTINCT CONCAT('> ', g.v_name, ' (', ROUND(f.i_qty), ')') SEPARATOR '\n')
                                FROM dvw_master.vw_packagedetail f
                                JOIN dvw_master.vw_item g ON f.fk_item = g.i_code
                                WHERE f.fk_package = d.fk_item
                                    AND f.b_isactive = 1
                            ) AS \`detail\`
                        FROM dvw_transaction.vw_transactiondetail d
                        JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                        WHERE d.b_isactive = 1
                            AND d.b_type = 2
                            AND d.fk_transaction = " ${fk_transaction}"
                    ) AS \`temp\`
                    ORDER BY \`temp\`.\`detail_code\``
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesDetail', resolve)
    })
}

type getReportSalesProductDetail = {
    transaction_code: number,
    date: string,
    qty: number,
    notes: string,
    receipt: string,
    customer: string,
    guest: string,
    price: number
}
export async function getReportSalesProductDetail({res, connection}: typeGlobal.functions, {type, fk_item, price, vw_transaction, vw_transactionpromotiondetail, vw_customer}: {type: number, fk_item: number, price?: number, vw_transaction: {fk_business: number, dt_paid: {date_start: string, date_end: string}}, vw_transactionpromotiondetail: {fk_promotion: number}, vw_customer: {v_code: string}}): Promise<Array<getReportSalesProductDetail>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        c.i_code AS \`transaction_code\`,
                        c.dt_paid AS \`date\`,
                        SUM(a.i_qty) AS \`qty\`,
                        a.v_preference AS \`notes\`,
                        c.s_offlinecode AS \`receipt\`,
                        IFNULL(d.v_name, '') AS \`customer\`,
                        IFNULL(c.v_guest, '') AS \`guest\`,
                        a.i_price AS \`price\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                    LEFT JOIN dvw_master.vw_customer d ON c.fk_customer = d.i_code AND d.b_isactive = 1
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON e.fk_transactiondetail = a.i_code AND e.b_isactive = 1
                    WHERE a.b_isactive = 1
                        AND c.b_isactive = 1
                        AND a.b_type = ${type}
                        AND c.fk_business = ${vw_transaction.fk_business}
                        AND a.fk_item = ${fk_item}
                        AND IFNULL(d.v_code, '') LIKE '${vw_customer.v_code}'
                        ${ price ?
                        `AND a.i_price = ${price}`
                        : ``}
                        AND IFNULL(e.fk_promotion,0) = ${vw_transactionpromotiondetail.fk_promotion}
                        AND a.b_isvoid = 0
                        AND c.b_isvoid = 0
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                    GROUP BY a.dt_created, a.v_preference;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesProductDetail', resolve)
    })
}

type getReportSalesComplete = {
    detail_code: any,
    item_code: any,
    sku: any,
    item_name: any,
    price: any,
    totalprice: any, 
    hpp: any,
    margin: any,
    qty: any,
    unit_code: any,
    notes: any,
    void_status: any,
    void_reason: any,
    has_stock: any,
    is_package: any,
    category_pph: any,
    category: any,
    categorycode: any,
    detail: any
}
export function getReportSalesComplete({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSalesComplete>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM (
                        SELECT 
                            a.i_code AS detail_code,
                            a.fk_item AS item_code, 
                            b.v_code AS sku,
                            b.v_name AS item_name,
                            a.i_price AS price,
                            (a.i_price * a.i_qty) - (IFNULL(z.i_promotionnominal, 0) * a.i_qty) as totalprice,
                            a.i_pricenet AS hpp,
                            (a.i_price - a.i_pricenet) / a.i_pricenet * 100 AS margin,
                            a.i_qty AS qty,
                            a.fk_unit AS unit_code,
                            d.v_name AS \`unit_name\`,
                            a.v_preference AS notes,
                            a.b_isvoid AS void_status,
                            a.v_voidreason AS void_reason,
                            b.b_hasstock AS has_stock,
                            0 AS is_package,
                            a.d_pph AS category_pph,
                            c.v_name AS category,
                            c.i_code AS categorycode,
                            '' AS detail
                        FROM dvw_transaction.vw_transactiondetail a
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail z ON z.fk_transactiondetail = a.i_code
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                        JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                        JOIN dvw_master.vw_unit d ON b.fk_unit = d.i_code
                        WHERE a.b_isactive = 1
                            AND a.b_type = 1
                            AND a.fk_transaction = ${fk_transaction}
                        UNION ALL
                            SELECT 
                            d.i_code AS detail_code,
                            d.fk_item AS item_code, 
                            e.v_code AS sku,
                            e.v_name AS item_name,
                            d.i_price AS price,
                            (d.i_price * d.i_qty) - (IFNULL(z.i_promotionnominal, 0) * d.i_qty) as totalprice,
                            d.i_pricenet AS hpp,
                            (d.i_price - d.i_pricenet) / d.i_pricenet * 100 AS margin,
                            d.i_qty AS qty,
                            0 AS unit_code,
                            'Pcs' AS \`unit_name\`,
                            d.v_preference AS notes,
                            d.b_isvoid AS void_status,
                            d.v_voidreason AS void_reason,
                            0 AS has_stock,
                            1 AS is_package,
                            0 AS category_pph,
                            'Paket' AS category,
                            '0' AS categorycode,
                            (
                                SELECT GROUP_CONCAT(DISTINCT CONCAT('> ', g.v_name, ' (', ROUND(f.i_qty), ')') SEPARATOR '\n')
                                FROM dvw_master.vw_packagedetail f
                                JOIN dvw_master.vw_item g ON f.fk_item = g.i_code
                                WHERE f.fk_package = d.fk_item
                                    AND f.b_isactive = 1
                            ) AS \`detail\`
                        FROM dvw_transaction.vw_transactiondetail d
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail z ON z.fk_transactiondetail = d.i_code
                        JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                        WHERE d.b_isactive = 1
                            AND d.b_type = 2
                            AND d.fk_transaction = ${fk_transaction}
                    ) AS \`temp\`
                    ORDER BY \`temp\`.\`detail_code\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesComplete', resolve)
    })
}

export function getReportCustomerHistoryItem({res, connection}: typeGlobal.functions, {vw_transaction}: {vw_transaction: {fk_customer: number, fk_business: number, dt_paid: {date_start: string, date_end: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        j.s_offlinecode AS \`receipt\`,
                        j.dt_paid AS \`date\`,
                        b.v_name AS \`item\`,
                        a.i_qty AS \`qty\`,
                        a.i_price AS \`price\`,
                        IFNULL(g.v_name, '') AS \`promotion\`,
                        IFNULL(f.i_promotionnominal, '0') AS \`total_promotion\`,
                        ((a.i_price*a.i_qty)-(IFNULL(f.i_promotionnominal,0)*a.i_qty)) AS \`total_net\`,
                        a.v_preference AS \`notes\`,
                        a.b_isvoid AS \`void\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction j ON a.fk_transaction = j.i_code
                    JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                    JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail f ON a.i_code = f.fk_transactiondetail
                    LEFT JOIN dvw_master.vw_promotion g ON f.fk_promotion = g.i_code
                    WHERE a.b_isactive = 1
                        AND a.b_type = 1
                        AND j.fk_customer = ${vw_transaction.fk_customer}
                        AND j.fk_business = ${vw_transaction.fk_business}
                        AND j.b_isactive = 1
                        AND DATE_FORMAT(j.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                        AND DATE_FORMAT(j.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                    UNION ALL
                        SELECT 
                            k.s_offlinecode AS \`receipt\`,
                            k.dt_paid AS \`date\`,
                            e.v_name AS \`item\`,
                            d.i_qty AS \`qty\`,
                            d.i_price AS \`price\`,
                            IFNULL(i.v_name, '') AS \`promotion\`,
                            IFNULL(h.i_promotionnominal, '') AS \`total_promotion\`,
                            ((d.i_price*d.i_qty)-(IFNULL(h.i_promotionnominal,0)*d.i_qty)) AS \`total_net\`,
                            d.v_preference AS \`notes\`,
                            d.b_isvoid AS \`void\`
                        FROM dvw_transaction.vw_transactiondetail d
                        JOIN dvw_transaction.vw_transaction k ON d.fk_transaction = k.i_code
                        JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail h ON d.i_code = h.fk_transactiondetail
                        LEFT JOIN dvw_master.vw_promotion i ON h.fk_promotion = i.i_code
                        WHERE d.b_isactive = 1
                            AND d.b_type = 2
                            AND k.fk_customer = ${vw_transaction.fk_customer}
                            AND k.fk_business = ${vw_transaction.fk_business}
                            AND k.b_isactive = 1
                            AND DATE_FORMAT(k.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(k.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}';`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportCustomerHistoryItem', resolve)
    })
}

export function getReportCustomerHistoryItemGroup({res, connection}: typeGlobal.functions, {vw_transaction}: {vw_transaction: {fk_customer: number, fk_business: number, dt_paid: {date_start: string, date_end: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        \`item\`, SUM(\`qty\`) AS \`qty\`, \`price\`, \`promotion\`, \`total_promotion\`, SUM(\`total_net\`) AS \`total_net\`, \`void\`
                    FROM(
                        SELECT 
                            a.fk_item AS \`code\`,
                            a.b_type AS \`type\`,
                            j.s_offlinecode AS \`receipt\`,
                            j.dt_paid AS \`date\`,
                            b.v_name AS \`item\`,
                            a.i_qty AS \`qty\`,
                            a.i_price AS \`price\`,
                            IFNULL(g.v_name, '') AS \`promotion\`,
                            IFNULL(f.i_promotionnominal, '0') AS \`total_promotion\`,
                            ((a.i_price*a.i_qty)-(IFNULL(f.i_promotionnominal,0)*a.i_qty)) AS \`total_net\`,
                            a.v_preference AS \`notes\`,
                            a.b_isvoid AS \`void\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction j ON a.fk_transaction = j.i_code
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                        JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail f ON a.i_code = f.fk_transactiondetail
                        LEFT JOIN dvw_master.vw_promotion g ON f.fk_promotion = g.i_code
                        WHERE a.b_isactive = 1
                            AND a.b_type = 1
                            AND j.fk_customer = ${vw_transaction.fk_customer}
                            AND j.fk_business = ${vw_transaction.fk_business}
                            AND j.b_isactive = 1
                            AND DATE_FORMAT(j.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(j.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                        UNION ALL
                            SELECT 
                                d.fk_item AS \`code\`,
                                d.b_type AS \`type\`,
                                k.s_offlinecode AS \`receipt\`,
                                k.dt_paid AS \`date\`,
                                e.v_name AS \`item\`,
                                d.i_qty AS \`qty\`,
                                d.i_price AS \`price\`,
                                IFNULL(i.v_name, '') AS \`promotion\`,
                                IFNULL(h.i_promotionnominal, '') AS \`total_promotion\`,
                                ((d.i_price*d.i_qty)-(IFNULL(h.i_promotionnominal,0)*d.i_qty)) AS \`total_net\`,
                                d.v_preference AS \`notes\`,
                                d.b_isvoid AS \`void\`
                            FROM dvw_transaction.vw_transactiondetail d
                            JOIN dvw_transaction.vw_transaction k ON d.fk_transaction = k.i_code
                            JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                            LEFT JOIN dvw_transaction.vw_transactionpromotiondetail h ON d.i_code = h.fk_transactiondetail
                            LEFT JOIN dvw_master.vw_promotion i ON h.fk_promotion = i.i_code
                            WHERE d.b_isactive = 1
                                AND d.b_type = 2
                                AND k.fk_customer = ${vw_transaction.fk_customer}
                                AND k.fk_business = ${vw_transaction.fk_business}
                                AND k.b_isactive = 1
                                AND DATE_FORMAT(k.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                                AND DATE_FORMAT(k.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                        ) AS \`temp\`
                        GROUP BY \`code\`, \`type\`, \`price\`, \`total_promotion\`, \`void\`
                        ORDER BY \`item\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportCustomerHistoryItemGroup', resolve)
    })
}

export function getReportSalesProductByCustomer({res, connection}: typeGlobal.functions, {vw_transaction}: {vw_transaction: {fk_business: number, dt_paid: {date_start: string, date_end: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM (
                        SELECT 
                            d.v_name AS \`customer\`,
                            CASE
                                WHEN a.fk_unit = b.fk_unit AND f.v_name IS NULL THEN b.v_name
                                WHEN a.fk_unit <> b.fk_unit THEN CONCAT(b.v_name, ' (', g.v_name, ')')
                                WHEN f.v_name IS NOT NULL THEN CONCAT(b.v_name, ' (', f.v_name, ')')
                                ELSE CONCAT(b.v_name, ' (', g.v_name, ')', ' (', f.v_name, ')')
                            END AS \`item\`,
                            b.v_code AS \`sku\`,
                            a.i_price AS \`price\`,
                            SUM(a.i_qty) AS \`qty\`,
                            a.i_price * SUM(a.i_qty) AS \`total\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_master.vw_customer d ON c.fk_customer = d.i_code AND d.b_isactive = 1
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON a.i_code  = e.fk_transactiondetail
                        LEFT JOIN dvw_master.vw_promotion f ON e.fk_promotion = f.i_code
                        LEFT JOIN dvw_master.vw_unit g ON a.fk_unit = g.i_code
                        WHERE a.b_isactive = 1
                            AND a.b_type = 1
                            AND c.fk_business = ${vw_transaction.fk_business}
                            AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                            AND a.b_isvoid = 0
                            AND c.b_isvoid = 0
                        GROUP BY d.i_code, b.v_code, a.i_price, IFNULL(e.fk_promotion,0), IFNULL(e.i_promotionnominal,0)
                        UNION ALL
                        SELECT 
                            d.v_name AS \`customer\`,
                            CASE
                                WHEN f.v_name IS NULL THEN b.v_name
                                ELSE CONCAT(b.v_name, ' (', f.v_name, ')')
                            END AS \`item\`,
                            b.v_code AS \`sku\`,
                            a.i_price AS price,
                            SUM(a.i_qty) AS qty,
                            a.i_price * SUM(a.i_qty) AS \`total\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_master.vw_package b ON a.fk_item = b.i_code
                        JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                        JOIN dvw_master.vw_customer d ON c.fk_customer = d.i_code AND d.b_isactive = 1
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON a.i_code  = e.fk_transactiondetail
                        LEFT JOIN dvw_master.vw_promotion f ON e.fk_promotion = f.i_code
                        LEFT JOIN dvw_master.vw_unit g ON a.fk_unit = g.i_code
                        WHERE a.b_isactive = 1
                            AND a.b_type = 2
                            AND c.fk_business = ${vw_transaction.fk_business}
                            AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                            AND a.b_isvoid = 0
                            AND c.b_isvoid = 0
                        GROUP BY d.i_code, b.v_code, a.i_price, IFNULL(e.fk_promotion,0), IFNULL(e.i_promotionnominal,0)
                    ) \`temp\`
                    ORDER BY \`customer\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesProductByCustomer', resolve)
    })
}

type getPreferencesReportSalesProductDetailReceipt = {
    transaction_code: number,
    date: string,
    qty: number,
    notes: string,
    receipt: string,
    customer: string,
    guest: string,
    price: number
}
export function getPreferencesReportSalesProductDetailReceipt({res, connection}: typeGlobal.functions, {b_type, fk_item, i_price, vw_transaction, vw_customer, vw_transactionpromotiondetail}: {b_type?: number, fk_item?: number, i_price?: number, vw_transaction: {fk_business: number, dt_paid: {date_start: string, date_end: string}}, vw_customer?: {v_code?: string}, vw_transactionpromotiondetail: {fk_promotion?: number}}): Promise<Array<getPreferencesReportSalesProductDetailReceipt>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        c.i_code AS \`transaction_code\`,
                        c.dt_paid AS date,
                        SUM(a.i_qty) AS qty,
                        a.v_preference AS notes,
                        c.s_offlinecode AS \`receipt\`,
                        IFNULL(d.v_name, '') AS customer,
                        IFNULL(c.v_guest, '') AS guest,
                        a.i_price AS \`price\`
                    FROM dvw_transaction.vw_transactiondetail a
                    JOIN dvw_transaction.vw_transaction c ON a.fk_transaction = c.i_code
                    LEFT JOIN dvw_master.vw_customer d ON c.fk_customer = d.i_code AND d.b_isactive = 1
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail e ON e.fk_transactiondetail = a.i_code AND e.b_isactive = 1
                    WHERE a.b_isactive = 1
                        AND c.b_isactive = 1
                        ${b_type ?
                        `AND a.b_type = ${b_type}`
                        : ``}
                        
                        AND c.fk_business = ${vw_transaction.fk_business}
                        
                        ${fk_item ?
                        `AND a.fk_item = ${fk_item}`
                        : ``}
                        
                        ${vw_customer?.v_code ?
                        `AND IFNULL(d.v_code, '') = '${vw_customer.v_code}'`
                        : ``
                        }
                        
                        ${i_price ?
                        `AND a.i_price = ${i_price}`
                        : ``}
                        
                        ${vw_transactionpromotiondetail.fk_promotion ?
                        `AND IFNULL(e.fk_promotion, 0) = ${vw_transactionpromotiondetail.fk_promotion}`
                        : ``}
                        
                        AND a.b_isvoid = 0
                        AND c.b_isvoid = 0
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                        AND DATE_FORMAT(c.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                    GROUP BY a.dt_created, a.v_preference;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesProductDetaiLReceipt', resolve)
    })
}

type getReportSalesProductDetailReceipt = {
    detailcode: number,
    itemcode: number,
    alias: string,
    itemname: string,
    price: number,
    hpp: number,
    margin: number,
    qty: number,
    unit: number,
    unit_name: string,
    preference: string,
    isvoid: number,
    voidreason: string,
    hasstock: number,
    ispackage: number,
    categorypph: number,
    category: string,
    categorycode: number,
    detail: string
}
export function getReportSalesProductDetailReceipt({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSalesProductDetailReceipt>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM (
                        SELECT 
                            a.i_code AS detailcode,
                            a.fk_item AS itemcode, 
                            b.v_code AS alias,
                            b.v_name AS itemname,
                            a.i_price AS price,
                            a.i_pricenet AS hpp,
                            (a.i_price - a.i_pricenet) / a.i_pricenet * 100 AS margin,
                            a.i_qty AS qty,
                            a.fk_unit AS unit,
                            d.v_name AS \`unit_name\`,
                            a.v_preference AS preference,
                            a.b_isvoid AS isvoid,
                            a.v_voidreason AS voidreason,
                            b.b_hasstock AS hasstock,
                            0 AS ispackage,
                            a.d_pph AS categorypph,
                            c.v_name AS category,
                            c.i_code AS categorycode,
                            '' AS detail
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                        JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                        JOIN dvw_master.vw_unit d ON b.fk_unit = d.i_code
                        WHERE a.b_isactive = 1
                            AND a.b_type = 1
                            AND a.fk_transaction = ${fk_transaction}
                        UNION ALL
                            SELECT 
                            d.i_code AS detailcode,
                            d.fk_item AS itemcode, 
                            e.v_code AS alias,
                            e.v_name AS itemname,
                            d.i_price AS price,
                            d.i_pricenet AS hpp,
                            (d.i_price - d.i_pricenet) / d.i_pricenet * 100 AS margin,
                            d.i_qty AS qty,
                            0 AS unit,
                            'Pcs' AS \`unit_name\`,
                            d.v_preference AS preference,
                            d.b_isvoid AS isvoid,
                            d.v_voidreason AS voidreason,
                            0 AS hasstock,
                            1 AS ispackage,
                            0 AS categorypph,
                            'Paket' AS category,
                            '0' AS categorycode,
                            (
                                SELECT GROUP_CONCAT(DISTINCT CONCAT('> ', g.v_name, ' (', ROUND(f.i_qty), ')') SEPARATOR '\n')
                                FROM dvw_master.vw_packagedetail f
                                JOIN dvw_master.vw_item g ON f.fk_item = g.i_code
                                WHERE f.fk_package = d.fk_item
                                    AND f.b_isactive = 1
                            ) AS \`detail\`
                        FROM dvw_transaction.vw_transactiondetail d
                        JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                        WHERE d.b_isactive = 1
                            AND d.b_type = 2
                            AND d.fk_transaction = ${fk_transaction}
                    ) AS \`temp\`
                    ORDER BY \`temp\`.\`detailcode\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportSalesProductDetailReceipt', resolve)
    })
}

type getReportShiftProductSales = {
    sku: string,
    category_name: string,
    item_name: string,
    total: string,
    total_price: string,
    category_code: string
}
export function getReportShiftProductSales({res, connection}: typeGlobal.functions, {fk_business, dt_paid, vw_transaction}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, vw_transaction: {v_paidby: string}}): Promise<Array<getReportShiftProductSales>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        \`sku\`,
                        \`category_name\`,
                        \`item_name\`,
                        \`total\`,
                        \`total_price\`,
                        \`category_code\`
                    FROM
                    (
                        SELECT
                            c.v_code AS \`sku\`,
                            d.v_name AS \`category_name\`,
                            c.v_name AS \`item_name\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            d.i_code AS \`category_code\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                        LEFT JOIN dvw_master.vw_category d ON c.fk_category = d.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND b.b_isvoid = 0
                            AND a.b_type = 1
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${vw_transaction.v_paidby}'
                        GROUP BY c.i_code
                        UNION ALL
                        SELECT
                            c.v_code AS \`sku\`,
                            'Package' AS \`category\`,
                            c.v_name AS \`item_name\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            0 AS \`category_code\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_package c ON a.fk_item = c.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND b.b_isvoid = 0
                            AND a.b_type = 2
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${vw_transaction.v_paidby}'
                        GROUP BY c.i_code
                    ) AS \`temp\`
                    ORDER BY category_code, item_name;
                    `
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportShiftProductSales', resolve)
    })
}

type getReportShiftProductSalesVoid = {
    sku: string,
    category_name: string,
    item_name: string,
    total: string,
    total_price: string,
    category_code: string
}
export function getReportShiftProductSalesVoid({res, connection}: typeGlobal.functions, {fk_business, dt_paid, vw_transaction}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, vw_transaction: {v_paidby: string}}): Promise<Array<getReportShiftProductSalesVoid>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        \`sku\`,
                        \`category_name\`,
                        \`item_name\`,
                        \`total\`,
                        \`total_price\`,
                        \`category_code\`
                    FROM
                    (
                        SELECT
                            c.v_code AS \`sku\`,
                            d.v_name AS \`category_name\`,
                            c.v_name AS \`item_name\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            d.i_code AS \`category_code\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1
                        JOIN dvw_master.vw_item c ON a.fk_item = c.i_code AND c.b_isactive = 1
                        LEFT JOIN dvw_master.vw_category d ON c.fk_category = d.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND (a.b_isvoid = 1 OR b.b_isvoid = 1)
                            AND a.b_type = 1
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${vw_transaction.v_paidby}'
                        GROUP BY c.i_code
                        UNION ALL
                        SELECT
                            c.v_code AS \`sku\`,
                            'Package' AS \`category_name\`,
                            c.v_name AS \`item_name\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            0 AS \`category_code\`
                        FROM dvw_transaction.vw_transactiondetail a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1
                        JOIN dvw_master.vw_package c ON a.fk_item = c.i_code AND c.b_isactive = 1
                        WHERE b.fk_business = ${fk_business}
                            AND (a.b_isvoid = 1 OR b.b_isvoid = 1)
                            AND a.b_type = 2
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND b.v_paidby LIKE '${vw_transaction.v_paidby}'
                        GROUP BY c.i_code
                    ) AS \`temp\`
                    ORDER BY category_code, item_name;
                    `
        functionGlobal.query(query, res, connection, 'function/transaction/transactiondetail/getReportShiftProductSalesVoid', resolve)
    })
}