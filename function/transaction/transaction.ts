import { ResultSetHeader } from "mysql2"
import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import moment from "moment"

export type get = {
    code: number,
    receipt: string,
    customer_name: string,
    customer_phone: string,
    total: number,
    date_paid: string,
    detail?: getDetail[]
}
export async function get<T extends get | get[]> ({res, connection} : typeGlobal.functions, {business, receipt, date_start, date_end, checkin} : {business?: number, receipt?: string, date_start?: string, date_end?: string, checkin?: string}): Promise<T>{
    return new Promise(async (resolve, reject) => {
        var orderString = " ORDER BY a.dt_paid";

        var whereReceipt = "";
        var whereDateStart = "";
        var whereDateEnd = "";
        var whereCheckin = "";

        if(receipt) whereReceipt = ` AND a.s_offlinecode = '${receipt}'`;
        if(date_start) whereDateStart = ` AND DATE(a.dt_paid) >= '${date_start}'`;
        if(date_end) whereDateEnd = ` AND DATE(a.dt_paid) <= '${date_end}'`;

        if(checkin){
            if(checkin == "1"){
                whereCheckin = ` AND a.dt_checkin IS NOT NULL`;
                orderString = " ORDER BY a.dt_checkin DESC";
            }
            else if(checkin == "0") whereCheckin = ` AND a.dt_checkin IS NULL`;
        }

        var whereBusiness = ` AND a.fk_business = ${business}`;
        if(business == 7151 || business == 7152) whereBusiness = ` AND (a.fk_business = 7151 OR a.fk_business = 7152)`;

        let query = `   SELECT 
                            a.i_code AS "code",
                            a.s_offlinecode AS "receipt",
                            IFNULL(b.v_name, "-") AS "customer_name",
                            IFNULL(b.v_phone, "-") AS "customer_phone",
                            IFNULL(a.i_totalnet, 0) AS "total",
                            a.dt_paid AS "date_paid",
                            IFNULL(a.dt_checkin, '') AS "date_checkin"
                        FROM dvw_transaction.vw_transaction a
                        LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                        WHERE a.b_isvoid = 0
                            AND a.b_isactive = 1
                            ${whereBusiness}
                            ${whereReceipt}
                            ${whereDateStart}
                            ${whereDateEnd}
                            ${whereCheckin}
                        ${orderString}
                        LIMIT 50;`

        functionGlobal.query(query, res, connection, 'function/transaction/get', resolve);
    })
}



export type getDetail = {
    code: number,
    name: string,
    sku: string,
    qty: number,
    price: number,
}

export async function getDetail<T extends getDetail[]> ({res, connection} : typeGlobal.functions, {transaction} : {transaction: number}): Promise<T>{
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT *
                        FROM (
                            SELECT 
                                a.i_code AS "code",
                                b.v_name AS "name",
                                b.v_code AS "sku",
                                a.i_qty AS "qty",
                                a.i_price AS "price"
                            FROM dvw_transaction.vw_transactiondetail a
                            JOIN dvw_master.vw_item b ON a.fk_item = b.i_code AND a.b_type = 1
                            WHERE a.fk_transaction = ${transaction}
                                AND a.b_isvoid = 0
                                AND a.b_isactive = 1
                            UNION
                            SELECT 
                                a.i_code AS "code",
                                b.v_name AS "name",
                                '-' AS "sku",
                                a.i_qty AS "qty",
                                a.i_price AS "price"
                            FROM dvw_transaction.vw_transactiondetail a
                            JOIN dvw_master.vw_package b ON a.fk_item = b.i_code AND a.b_type = 2
                            WHERE a.fk_transaction = ${transaction}
                                AND a.b_isvoid = 0
                                AND a.b_isactive = 1
                            ) temp
                            ORDER BY temp.code`

        functionGlobal.query(query, res, connection, 'function/transaction/getDetail', resolve);
    })
}



export async function checkin ({res, connection} : typeGlobal.functions, {code, date} : {code: number, date: string}){
    return new Promise((resolve, reject) => {
        let query = `   UPDATE dvw_transaction.vw_transaction SET
                            dt_checkin = '${date}'
                        WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/transaction/checkin', resolve)
    })
}



type getTransactionTotalNet = {
    resultTotal: number
}
export async function getTransactionTotalNet ({res, connection, fk_business, dt_paid}: typeGlobal.functions & {fk_business: number, dt_paid: string}): Promise<getTransactionTotalNet> {
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            total: number
        }
        let query = `SELECT 
                        IFNULL(SUM(a.i_totalnet), 0) AS "total"
                    FROM dvw_transaction.vw_transaction a
                    WHERE a.fk_business = ${fk_business}
                        AND DATE(a.dt_paid) = DATE('${dt_paid}')
                        AND a.b_isvoid = 0
                        AND a.b_isactive = 1`
        let result:queryResult = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/transaction/getTransactionTotalNet', resolve))
        resolve(<getTransactionTotalNet> {
            resultTotal: result.total
        })
    })
}

type getExistingTransaction = {
    code: number,
    paymentMethodSystem: number
}
export async function getExistingTransaction ({res, connection, fk_business, dt_paid}: typeGlobal.functions & {fk_business: number, dt_paid: string}): Promise<getExistingTransaction> {
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            code: number,
            total: number,
            payment_method_system: number,
        }
        let query = `SELECT *
                    FROM (
                        SELECT 
                            a.i_code AS "code",
                            a.i_totalnet AS "total",
                            MAX(c.fk_systempaymentmethod) AS "payment_method_system"
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactionpayment b ON a.i_code = b.fk_transaction
                        JOIN dvw_master.vw_paymentmethod c ON b.fk_paymentmethod = c.i_code
                        WHERE a.b_isactive = 1
                            AND a.b_isvoid = 0
                            AND a.fk_business = ${fk_business}
                            AND DATE(a.dt_paid) = DATE('${dt_paid}')
                        GROUP BY a.i_code
                    ) "temp"
                    WHERE "temp"."payment_method_system" = 1
                    ORDER BY "total" DESC`
        let result: queryResult = await new Promise(async (resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/transaction/getExistingTransaction', resolve))
        resolve(<getExistingTransaction>{
            code: result.code
        })
    })
}



export async function softDeleteTransaction ({res, connection, code} : typeGlobal.functions & {code: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_transaction.vw_transaction SET
                        b_isactive = 0
                    WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/transaction/softDeleteTransaction', resolve)
    })
}



type getTransactions = {
    code: number,
    orderNumber: number,
    dtPaid: string,
}

export async function getTransactions ({res, connection, offlinecode, fk_business} : typeGlobal.functions & {offlinecode: string, fk_business: number}): Promise<getTransactions[]>{
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            i_code: number,
            ordernumber: number,
            date: string
        }
        let query = `SELECT 
                        a.i_code, 
                        a.i_ordernumber AS "ordernumber", 
                        a.dt_paid AS "date"
                    FROM dvw_transaction.vw_transaction a
                    WHERE a.b_isactive = 1
                            AND a.s_offlinecode = '${offlinecode}'
                            AND a.fk_business = ${fk_business}`
        let result: queryResult[] = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/transaction/getTransactions', resolve))
        resolve(<getTransactions[]>result.map((eachResult) => {
            let date = moment(Date.parse(eachResult.date.toString().replace( /[-]/g, '/' ))).format('YYYY-MM-DD HH:mm:ss')
            return ({
            code: eachResult.i_code,
            orderNumber: eachResult.ordernumber,
            dtPaid: date
        })}))
    })
}



type insertTransaction = {
    insertId: number,
}

export async function insertTransaction(
    {res, connection}: typeGlobal.functions, 
    {
        offlinecode, fk_business, fk_customer, fk_salestype, ordernumber,
        createdby, dt_created, guest, email
    }   : {
            offlinecode: string, fk_business: number, fk_customer: number,
            fk_salestype: number, ordernumber: number, createdby: string,
            dt_created: string, guest: string, email: string
        }
    ): Promise<insertTransaction> {
    return new Promise(async(resolve, reject) => {
        let query = `   INSERT INTO dvw_transaction.vw_transaction(s_offlinecode, fk_business, fk_customer, fk_salestype, v_code, i_ordernumber, v_createdby, dt_created, v_guest, v_email)
                        VALUES ('${offlinecode}', ${fk_business}, ${fk_customer}, ${fk_salestype}, '', ${ordernumber}, '${createdby}', '${dt_created}', '${guest}', '${email}')`
        let result:ResultSetHeader = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/transaction/insertTransaction', resolve))
        resolve(<insertTransaction>{
            insertId: result.insertId
        })
    })
}



export async function update(
    {res, connection}: typeGlobal.functions, 
    {
        total, totalpromotion, vatnominal, scnominal, totalnet, issplit,
        paidby, dt_paid, ispaid, code
    }:  {
            total: number, totalpromotion: number, vatnominal: number,
            scnominal: number, totalnet: number, issplit: number,
            paidby: string, dt_paid: string, ispaid: number, code: number
        }
) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_transaction.vw_transaction SET
                        i_total = ${total},
                        i_totalpromotion = ${totalpromotion},
                        i_vatnominal = ${vatnominal},
                        i_scnominal = ${scnominal},
                        i_totalnet = ${totalnet},
                        b_issplit = ${issplit},
                        v_paidby = '${paidby}',
                        dt_paid = '${dt_paid}',
                        b_ispaid = ${ispaid}
                    WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/update', resolve)
    })
}



export async function getCode({res, connection}: typeGlobal.functions, {offlinecode, fk_business}: {offlinecode: string, fk_business: number}): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT a.i_code
                        FROM dvw_transaction.vw_transaction a
                        WHERE a.s_offlinecode = '${offlinecode}'
                            AND a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getCode', resolve)
    })
}



type reportShiftPaymentmethod = {
    name: string,
    subtotal: number,
    changes: number,
    total: number,
    systempaymentmethod: number
}
export async function reportShiftPaymentmethod({res, connection}: typeGlobal.functions, {fk_business, paidby, dt_paid}: {fk_business: number, paidby: string, dt_paid: {date_start: string, date_end: string}}): Promise<Array<reportShiftPaymentmethod>> {
    if(fk_business == 57 || fk_business == 5546) paidby = "%"

    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`name\` AS \`name\`,
                        SUM(\`total\`) AS \`subtotal\`,
                        SUM(\`changes\`) AS \`changes\`,
                        CASE
                            WHEN \`systempaymentmethod\` = 1 THEN SUM(\`total\`) - SUM(\`changes\`)
                            ELSE SUM(\`total\`)
                        END AS \`total\`,
                        \`systempaymentmethod\` AS \`system\`
                    FROM
                    (
                        SELECT 
                            c.v_name AS \`name\`,
                            b.fk_paymentmethod AS \`paymentmethod\`,
                            SUM(b.i_paidmoney) AS \`total\`,
                            (a.i_changes) AS \`changes\`,
                            c.fk_systempaymentmethod AS \`systempaymentmethod\`
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactionpayment b ON b.fk_transaction = a.i_code
                        JOIN dvw_master.vw_paymentmethod c ON c.i_code = b.fk_paymentmethod
                        WHERE
                            a.fk_business = ${fk_business}
                            AND a.v_paidby LIKE '${paidby}'
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND a.b_ispaid = 1
                            AND a.b_isactive = 1
                            AND a.b_isvoid = 0
                        GROUP BY b.fk_paymentmethod, a.i_code
                    ) AS temp
                    GROUP BY \`paymentmethod\`
                    ORDER BY \`systempaymentmethod\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/resReportShiftPaymentmethod', resolve)
    })
}

type reportShiftOtherDetail = {
    total_sales_additional: number,
    total_promotion: number,
    tax: number,
    service_charge: number
}
export async function reportShiftOtherDetail ({res, connection}: typeGlobal.functions, {fk_business, paidby, dt_paid}: {fk_business: number, paidby: string, dt_paid: {start_date: string, end_date: string}}): Promise<reportShiftOtherDetail | undefined> {
    if(fk_business == 57 || fk_business == 5546) paidby = "%"
    
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional\`,
                        IFNULL(SUM(\`total_promotion\`),0) AS \`total_promotion\`,
                        IFNULL(SUM(\`tax\`),0) AS \`tax\`,
                        IFNULL(SUM(\`service_charge\`) + SUM(\`rounded\`),0) AS \`service_charge\`
                    FROM
                    (
                        SELECT
                            IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional\`,
                            IFNULL(SUM(\`total_promotion\`),0) + IFNULL(y.i_promotionnominal,0) AS \`total_promotion\`,
                            IFNULL(z.i_vatnominal,0) AS \`tax\`,
                            IFNULL(z.i_scnominal,0) AS \`service_charge\`,
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
                            WHERE
                                a.fk_business = ${fk_business}
                                AND a.v_paidby LIKE '${paidby}'
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.start_date}', '%Y-%m-%d %H:%i')
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.end_date}', '%Y-%m-%d %H:%i')
                                AND a.b_ispaid = 1
                                AND a.b_isactive = 1
                                AND a.b_isvoid = 0
                            GROUP BY c.i_code
                        ) AS temp
                        JOIN dvw_transaction.vw_transaction z ON temp.code = z.i_code
                        LEFT JOIN dvw_transaction.vw_transactionpromotion y ON temp.code = y.fk_transaction
                        JOIN dvw_account.vw_business h ON z.fk_business = h.i_code
                        GROUP BY z.i_code
                    ) AS temp1;`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transaction/reportShiftOtherDetail', resolve)
    })
}

type getReport = {
    date: string,
    qty: number,
    subtotal: number,
    total_promotion: number,
    ppn: number,
    service_charge: number,
    total: number,
    average: number
}
export async function getReport({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {startdate: string, enddate: string}}): Promise<Array<getReport>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        DATE_FORMAT(a.dt_paid, '%Y-%m-%d') AS 'date',
                        COUNT(1) AS 'qty',
                        SUM(a.i_total) AS 'subtotal',
                        SUM(a.i_totalpromotion) AS 'total_promotion',
                        SUM(a.i_vatnominal) AS 'ppn',
                        SUM(a.i_scnominal) AS 'service_charge',
                        SUM(a.i_totalnet) AS 'total',
                        SUM(a.i_totalnet) / COUNT(1) AS 'average'
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.b_isvoid = 0
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.startdate}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.enddate}'
                    GROUP BY DATE_FORMAT(a.dt_paid, '%Y-%m-%d');`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReport', resolve)
        
    })
}

type getReportSalesType = {
    salestype_name: string,
    total_net: number
}
export async function getDayReportSalesType ({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {start_date: string, end_date: string, selected_date: string}}): Promise<Array<getReportSalesType>> {
    return new Promise((resolve, reject) => {
        let query = ` SELECT 
                        aa.salestype AS 'salestype_name',
                        IFNULL(SUM(bb.i_totalnet), 0) AS 'total_net'
                    FROM (
                        SELECT DISTINCT b.i_code AS 'code', b.v_name AS 'salestype'
                        FROM dvw_transaction.vw_transaction a 
                        JOIN dvw_master.vw_salestype b ON a.fk_salestype = b.i_code
                        WHERE a.fk_business = ${fk_business}
                            AND a.b_isactive = 1
                            AND a.b_isvoid = 0
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.start_date}'
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.end_date}'
                    ) aa
                    LEFT JOIN dvw_transaction.vw_transaction bb ON 
                        aa.code = bb.fk_salestype 
                        AND DATE(bb.dt_paid) = '${dt_paid.selected_date}'
                        AND bb.fk_business = ${fk_business}
                        AND bb.b_isactive = 1
                        AND bb.b_isvoid = 0
                    GROUP BY aa.salestype`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getSalesTypeReport', resolve)
    })
}

export async function setVarForGetDayReport ({res, connection}: typeGlobal.functions, {dt_paid}: {dt_paid: {end_date: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SET @n:=DATE('${dt_paid.end_date}' + interval 1 DAY);`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/setVarForGetDayReport', resolve)
    })
}

type getDayReport = {
    date: string,
    total: number,
    total_transaction: number
}
export async function getDayReport ({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {end_date: string, date_diff: number}}): Promise<Array<getDayReport>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        day_series AS date,
                        IFNULL(data.total, 0) AS total,
                        IFNULL(data.total_transaction, 0) AS total_transaction
                    FROM (
                        SELECT 
                            SUM(a.i_totalnet) AS total,
                            COUNT(1) AS total_transaction,
                            DATE(a.dt_paid) AS date
                        FROM dvw_transaction.vw_transaction a 
                        WHERE a.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND a.b_isactive = 1
                            AND DATE(a.dt_paid) <= '${dt_paid.end_date}'
                            AND DATE(a.dt_paid) >= DATE_SUB('${dt_paid.end_date}', INTERVAL ${dt_paid.date_diff} DAY)
                        GROUP BY DATE(a.dt_paid)
                    ) data
                    RIGHT JOIN (
                        SELECT 
                            (select @n:= @n - interval 1 day) day_series 
                        from dvw_master.vw_item 
                        LIMIT ${dt_paid.date_diff}
                    ) date ON data.date = date.day_series
                    ORDER BY day_series;`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getDayReport', resolve)
    })
}

type getHourlySalesReport = {
    hour: string,
    qty: number,
    total: number
}
export async function getHourlySalesReport({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {start_date: string, end_date: string}}): Promise<Array<getHourlySalesReport>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        CONCAT((CONCAT(HOUR(a.dt_paid), ':00 - ')), (CONCAT(HOUR(a.dt_paid)+1, ':00')))  AS \`hour\`,
                        COUNT(1) AS \`qty\`,
                        SUM(a.i_totalnet) AS \`total\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.b_isvoid = 0
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.start_date}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.end_date}'
                    GROUP BY HOUR(a.dt_paid);`
        functionGlobal.query(query, res, connection, 'function/transaction/getHourlySalesReport', resolve)
    })
}

type getReportSales = {
    code: number,
    order_number: number,
    receipt: string,
    customer_code: number,
    customer_name: string,
    guest: string,
    order_taker: string,
    cashier: string,
    date: string,
    date_paid: string,
    subtotal: number,
    tax: number,
    service_charge: number,
    tax_percent: number,
    service_charge_percent: number,
    promotion_value: number,
    promotion_name: string,
    total_promotion: number,
    total: number,
    hpp: number,
    margin: number,
    changes: number,
    void_status: number,
    salestype_code: number,
    salestype_name: string,
    process_status: number
}
export async function getReportSales({res, connection}: typeGlobal.functions, {fk_business, dt_paid, isvoid}: {fk_business: number, dt_paid: {start_date: string, end_date: string}, isvoid?: number}):Promise<Array<getReportSales>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.i_ordernumber AS \`order_number\`,
                        a.s_offlinecode AS \`receipt\`,
                        IFNULL(b.i_code, 0) AS \`customer_code\`,
                        IFNULL(b.v_name, '') AS \`customer_name\`,
                        IFNULL(a.v_guest, '') AS \`guest\`,
                        a.v_createdby AS \`order_taker\`,
                        a.v_paidby AS \`cashier\`,
                        a.dt_created AS \`date\`,
                        a.dt_paid AS \`date_paid\`,
                        a.i_total AS \`subtotal\`,
                        a.i_vatnominal AS \`tax\`,
                        a.i_scnominal AS \`service_charge\`,
                        IFNULL(a.i_vat, 0) AS \`tax_percent\`,
                        IFNULL(a.i_sc, 0) AS \`service_charge_percent\`,
                        d.i_promotionnominal AS \`promotion_value\`,
                        e.v_name AS \`promotion_name\`,
                        a.i_totalpromotion AS \`total_promotion\`,
                        a.i_totalnet AS \`total\`,
                        COALESCE(SUM(j.i_pricenet * j.i_qty), 0) AS \`hpp\`,
                        COALESCE(a.i_totalnet - a.i_vatnominal - a.i_scnominal - a.i_pph23 - SUM(j.i_pricenet * j.i_qty), 0) AS \`margin\`, 
                        a.i_changes AS \`changes\`,
                        a.b_isvoid AS \`void_status\`,
                        a.v_voidreason AS \`void_reason\`,
                        a.fk_salestype AS \`salestype_code\`,
                        c.v_name AS \`salestype_name\`,
                        a.b_process AS \`process_status\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpromotion d ON a.i_code = d.fk_transaction
                    LEFT JOIN dvw_master.vw_promotion e ON d.fk_promotion = e.i_code
                    LEFT JOIN dvw_account.vw_user h ON h.i_code = a.fk_usercreate
                    LEFT JOIN dvw_account.vw_user i ON i.i_code = a.fk_userpaid
                    LEFT JOIN dvw_transaction.vw_transactiondetail j ON j.fk_transaction = a.i_code AND j.b_isvoid = 0
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.start_date}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.end_date}'
                        ${isvoid ?
                        `AND a.b_isvoid = '${isvoid}'`
                        : ''}
                    GROUP BY a.i_code;`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportSales', resolve)
    })
}

export async function getReportSalesSuperselling({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {start_date: string, end_date: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.s_offlinecode AS \`receipt\`,
                        IFNULL(b.i_code, 0) AS \`customer_code\`,
                        IFNULL(b.v_name, '') AS \`customer_name\`,
                        IFNULL(a.v_guest, '') AS \`guest\`,
                        a.dt_paid AS \`date_paid\`,
                        a.i_total AS \`subtotal\`,
                        a.i_vatnominal AS \`tax\`,
                        a.i_scnominal AS \`service_charge\`,
                        d.i_promotionnominal AS \`promotion_value\`,
                        e.v_name AS \`promotion_name\`,
                        a.i_totalpromotion AS \`total_promotion\`,
                        a.i_totalnet AS \`total\`,
                        a.b_process AS \`process_status\`,
                        a.v_process_photo AS \`process_photo\`,
                        a.dt_process AS \`process_date\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpromotion d ON a.i_code = d.fk_transaction
                    LEFT JOIN dvw_master.vw_promotion e ON d.fk_promotion = e.i_code
                    LEFT JOIN dvw_account.vw_user h ON h.i_code = a.fk_usercreate
                    LEFT JOIN dvw_account.vw_user i ON i.i_code = a.fk_userpaid
                    LEFT JOIN dvw_transaction.vw_transactiondetail j ON j.fk_transaction = a.i_code AND j.b_isvoid = 0
                    JOIN dvw_transaction.vw_transactionpayment k ON a.i_code = k.fk_transaction AND i_mdr > 5
                    JOIN dvw_master.vw_paymentmethod l ON k.fk_paymentmethod = l.i_code AND l.fk_systempaymentmethod = 16
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.dt_paid >= '${dt_paid.start_date}'
                        AND a.dt_paid <= '${dt_paid.end_date}'
                    GROUP BY a.i_code`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportSalesSuperselling', resolve)
    })
}

type getReportSalesComplete = { 
    code: any, 
    order_any: any, 
    receipt: any, 
    receipt_code: any, 
    customer_code: any, 
    customer_name: any, 
    guest: any, 
    order_taker: any, 
    cashier: any, 
    date: any, 
    date_paid: any, 
    subtotal: any, 
    tax: any, 
    service_charge: any, 
    tax_percent: any, 
    service_charge_percent: any, 
    promotion_value: any, 
    promotion_name: any, 
    total_promotion: any, 
    rounded: any, 
    total: any, 
    hpp: any, 
    margin: any, 
    changes: any, 
    void_status: any, 
    salestype_code: any, 
    salestype_name: any, 
    process_status: any, 
    total_qty: any,
    total_cart_price: any,
    totalnet_cart_price: any
}
export async function getReportSalesComplete({res, connection}: typeGlobal.functions, {fk_business, dt_paid, isvoid}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, isvoid: string}): Promise<Array<getReportSalesComplete>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.i_ordernumber AS \`order_number\`,
                        a.s_offlinecode AS \`receipt\`,
                        a.v_code AS \`receipt_code\`,
                        IFNULL(b.i_code, 0) AS \`customer_code\`,
                        IFNULL(b.v_name, '') AS \`customer_name\`,
                        IFNULL(a.v_guest, '') AS \`guest\`,
                        a.v_createdby AS \`order_taker\`,
                        a.v_paidby AS \`cashier\`,
                        a.dt_created AS \`date\`,
                        a.dt_paid AS \`date_paid\`,
                        a.i_total AS \`subtotal\`,
                        a.i_vatnominal AS \`tax\`,
                        a.i_scnominal AS \`service_charge\`,
                        IFNULL(a.i_vat, 0) AS \`tax_percent\`,
                        IFNULL(a.i_sc, 0) AS \`service_charge_percent\`,
                        IFNULL(d.i_promotionnominal, 0) AS \`promotion_value\`,
                        e.v_name AS \`promotion_name\`,
                        a.i_totalpromotion AS \`total_promotion\`,
                        a.i_rounded AS \`rounded\`,
                        a.i_totalnet AS \`total\`,
                        COALESCE(SUM(j.i_pricenet * j.i_qty), 0) AS \`hpp\`,
                        IFNULL(a.i_totalnet - a.i_vatnominal - a.i_scnominal - a.i_pph23 - SUM(j.i_pricenet * j.i_qty), '0') AS \`margin\`, 
                        a.i_changes AS \`changes\`,
                        a.b_isvoid AS \`void_status\`,
                        a.fk_salestype AS \`salestype_code\`,
                        c.v_name AS \`salestype_name\`,
                        a.b_process AS \`process_status\`,
                        (
                            SELECT SUM(z.i_qty)
                            FROM dvw_transaction.vw_transactiondetail z
                            WHERE z.fk_transaction = a.i_code
                                AND z.b_isactive = 1
                                AND z.b_isvoid = 0
                        ) AS \`total_qty\`,
                        IFNULL((
                            SELECT SUM(zz.i_price)
                            FROM dvw_transaction.vw_transactiondetail zz
                            WHERE zz.fk_transaction = a.i_code
                                AND zz.b_isactive = 1
                                AND zz.b_isvoid = 0
                        ), 0) AS \`total_cart_price\`,
                        IFNULL((
                            SELECT SUM((zzz.i_price * zzz.i_qty) - IFNULL((yyy.i_promotionnominal * zzz.i_qty), 0))
                            FROM dvw_transaction.vw_transactiondetail zzz
                            LEFT JOIN dvw_transaction.vw_transactionpromotiondetail yyy ON yyy.fk_transactiondetail = zzz.i_code
                            WHERE zzz.fk_transaction = a.i_code
                                AND zzz.b_isactive = 1
                                AND zzz.b_isvoid = 0
                        ), 0) AS \`totalnet_cart_price\`,
                        CASE
                            WHEN IFNULL(k.b_relx, 0) = 1 THEN (
                                                                SELECT
                                                                    COUNT(1)
                                                                FROM tkd_relx.rlx_point_movement a
                                                                WHERE a.fk_source = a.s_offlinecode
                                                                )
                            ELSE 0
                        END as point_scanned
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpromotion d ON a.i_code = d.fk_transaction
                    LEFT JOIN dvw_master.vw_promotion e ON d.fk_promotion = e.i_code
                    LEFT JOIN dvw_account.vw_user h ON h.i_code = a.fk_usercreate
                    LEFT JOIN dvw_account.vw_user i ON i.i_code = a.fk_userpaid
                    LEFT JOIN dvw_transaction.vw_transactiondetail j ON j.fk_transaction = a.i_code AND j.b_isvoid = 0
                    LEFT JOIN dvw_setting.vw_other k ON k.fk_business = a.fk_business
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        AND a.b_isvoid LIKE '${isvoid}'
                    GROUP BY a.i_code;`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportSalesComplete', resolve)
    })
}

type getReportSalesDetail = { 
    code: string, 
    order_number: string, 
    receipt: string, 
    customer_code: string, 
    customer_name: string, 
    guest: string, 
    order_taker: string, 
    cashier: string, 
    date: string, 
    date_paid: string, 
    subtotal: string, 
    tax: string, 
    service_charge: string, 
    tax_percent: string, 
    service_charge_percent: string, 
    promotion_value: string, 
    promotion_name: string, 
    total_promotion: string, 
    total: string, 
    hpp: string, 
    margin: string, 
    changes: string, 
    void_status: string, 
    salestype_code: string, 
    salestype_name: string, 
    process_status: string
}
export async function getReportSalesDetail({res, connection}: typeGlobal.functions, {fk_business, offlinecode}: {fk_business: number, offlinecode: string}): Promise<getReportSalesDetail> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.i_ordernumber AS \`order_number\`,
                        a.s_offlinecode AS \`receipt\`,
                        IFNULL(b.i_code, 0) AS \`customer_code\`,
                        IFNULL(b.v_name, '') AS \`customer_name\`,
                        IFNULL(b.v_phone, '') AS \`customer_phone\`,
                        IFNULL(a.v_guest, '') AS \`guest\`,
                        a.v_createdby AS \`order_taker\`,
                        a.v_paidby AS \`cashier\`,
                        a.dt_created AS \`date\`,
                        a.dt_paid AS \`date_paid\`,
                        a.i_total AS \`subtotal\`,
                        a.i_vatnominal AS \`tax\`,
                        a.i_scnominal AS \`service_charge\`,
                        IFNULL(a.i_vat, 0) AS \`tax_percent\`,
                        IFNULL(a.i_sc, 0) AS \`service_charge_percent\`,
                        IFNULL(d.i_promotionnominal, 0) AS \`promotion_value\`,
                        IFNULL(e.v_name, 0) AS \`promotion_name\`,
                        a.i_totalpromotion AS \`total_promotion\`,
                        a.i_totalnet AS \`total\`,
                        COALESCE(SUM(j.i_pricenet * j.i_qty), 0) AS \`hpp\`,
                        IFNULL(a.i_totalnet - a.i_vatnominal - a.i_scnominal - a.i_pph23 - SUM(j.i_pricenet * j.i_qty), '0') AS \`margin\`, 
                        a.i_changes AS \`changes\`,
                        a.b_isvoid AS \`void_status\`,
                        a.fk_salestype AS \`salestype_code\`,
                        c.v_name AS \`salestype_name\`,
                        a.b_process AS \`process_status\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpromotion d ON a.i_code = d.fk_transaction
                    LEFT JOIN dvw_master.vw_promotion e ON d.fk_promotion = e.i_code
                    LEFT JOIN dvw_account.vw_user h ON h.i_code = a.fk_usercreate
                    LEFT JOIN dvw_account.vw_user i ON i.i_code = a.fk_userpaid
                    LEFT JOIN dvw_transaction.vw_transactiondetail j ON j.fk_transaction = a.i_code AND j.b_isvoid = 0
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.s_offlinecode = '${offlinecode}'`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transaction/getReportSalesDetail', resolve)
    })
}

type getReportSalesProduct = {
    code: string,
    category: string,
    unit_code: string,
    unit: string,
    item: string,
    item_name: string,
    total: string,
    total_price_net: string,
    price: string,
    
}
export async function getReportSalesProduct({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {date_start: string, date_end: string}}, {order_column, order_type, limit}: {order_column: string, order_type?: string, limit?: number}): Promise<Array<getReportSalesProduct>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`code\`,
                        \`category\`,
                        \`unit_code\`,
                        \`unit\`,
                        CASE
                            WHEN \`promotion\` IS NOT NULL THEN CONCAT(\`item\`, ' (', \`promotion\`, ')')
                            ELSE \`item\`
                        END AS \`item_name\`,
                        \`item\` AS \`item\`,
                        \`total\`,
                        \`total_price_net\`,
                        \`price\`,
                        CASE
                            WHEN \`promotion\` IS NOT NULL AND \`promotionName\` <> 'Point' THEN \`totalafterpromotionqty\`
                            ELSE \`total_price\`
                        END AS \`total_price\`,
                        \`itemCode\` AS \`item_code\`,
                        \`categoryCode\` AS \`category_code\`,
                        \`promotionCode\` AS \`promotion_code\`,
                        \`promotionName\` AS \`promotion_name\`,
                        \`type\`,
                        \`ordertaker\` AS \`order_taker\`,
                        \`promotionnominal\` AS \`promotion_nominal\`
                    FROM
                    (
                        SELECT
                            c.v_code AS \`code\`,
                            d.v_name AS \`category\`,
                            e.i_code AS \`unit_code\`,
                            e.v_name AS \`unit\`,
                            CASE
                                WHEN a.fk_unit = c.fk_unit THEN c.v_name
                                ELSE CONCAT(c.v_name, ' (', e.v_name, ')')
                            END AS \`item\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_pricenet) AS \`total_price_net\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            a.i_price AS \`price\`,
                            c.i_code AS \`itemcode\`,
                            d.i_code AS \`categoryCode\`,
                            g.v_name AS \`promotion\`,
                            IFNULL(g.i_code, 0) AS \`promotionCode\`,
                            IFNULL(g.v_name, '') AS \`promotionName\`,
                            1 AS \`type\`,
                            b.v_createdby AS \`ordertaker\`,
                            CASE
                                WHEN IFNULL(f.fk_promotion,0) = 3 THEN IFNULL(f.i_promotionnominal,0) / a.i_qty
                                ELSE f.i_promotionnominal
                            END AS \`promotionnominal\`,
                            CASE
                                WHEN IFNULL(f.fk_promotion,0) = 3 THEN ((a.i_price - IFNULL(f.i_promotionnominal,0) / a.i_qty)* SUM(a.i_qty))
                                ELSE ((a.i_price - IFNULL(f.i_promotionnominal,0))* SUM(a.i_qty))
                            END AS \`totalafterpromotionqty\`,
                            '' AS \`detail\`
                        FROM (
                            SELECT DISTINCT aa.i_code AS \`code\`
                            FROM dvw_transaction.vw_transaction aa
                            JOIN dvw_transaction.vw_transactionpayment bb ON aa.i_code = bb.fk_transaction
                            WHERE aa.fk_business = ${fk_business}
                                AND aa.b_ispaid = 1 
                                AND aa.b_isactive = 1 
                                AND aa.b_isvoid = 0
                                AND DATE_FORMAT(aa.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                                AND DATE_FORMAT(aa.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        ) z
                        JOIN dvw_transaction.vw_transactiondetail a ON z.code = a.fk_transaction
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                        LEFT JOIN dvw_master.vw_category d ON c.fk_category = d.i_code
                        LEFT JOIN dvw_master.vw_unit e ON a.fk_unit = e.i_code
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail f ON a.i_code  = f.fk_transactiondetail
                        LEFT JOIN dvw_master.vw_promotion g ON f.fk_promotion = g.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND a.b_type = 1
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        GROUP BY c.i_code, a.fk_unit, a.i_price, IFNULL(f.fk_promotion,0), IFNULL(f.i_promotionnominal,0)
                        UNION ALL
                        SELECT
                            c.v_code AS \`code\`,
                            'Package' AS \`category\`,
                            0 AS \`unit_code\`,
                            '' AS \`unit\`,
                            c.v_name AS \`item\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_pricenet) AS \`total_price_net\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            a.i_price AS \`price\`,
                            c.i_code AS \`itemcode\`,
                            0 AS \`categoryCode\`,
                            e.v_name AS \`promotion\`,
                            IFNULL(e.i_code, 0) AS \`promotionCode\`,
                            IFNULL(e.v_name, '') AS \`promotionName\`,
                            2 AS \`type\`,
                            b.v_createdby AS \`ordertaker\`,
                            d.i_promotionnominal AS \`promotionnominal\`,
                            ((a.i_price - IFNULL(d.i_promotionnominal,0)) * SUM(a.i_qty)) AS \`totalafterpromotionqty\`,
                            (
                                SELECT GROUP_CONCAT(DISTINCT CONCAT(ROUND(f.i_qty), ' x ', g.v_name) SEPARATOR '\n')
                                FROM dvw_master.vw_packagedetail f
                                JOIN dvw_master.vw_item g ON f.fk_item = g.i_code
                                WHERE f.fk_package = c.i_code
                            ) AS \`detail\`
                        FROM (
                            SELECT aa.i_code AS \`code\`
                            FROM dvw_transaction.vw_transaction aa
                            JOIN dvw_transaction.vw_transactionpayment bb ON aa.i_code = bb.fk_transaction
                            WHERE aa.fk_business = ${fk_business}
                                AND aa.b_ispaid = 1 
                                AND aa.b_isactive = 1 
                                AND aa.b_isvoid = 0
                                AND DATE_FORMAT(aa.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                                AND DATE_FORMAT(aa.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        ) z
                        JOIN dvw_transaction.vw_transactiondetail a ON z.code = a.fk_transaction
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_package c ON a.fk_item = c.i_code AND c.b_isactive = 1
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail d ON a.i_code  = d.fk_transactiondetail
                        LEFT JOIN dvw_master.vw_promotion e ON d.fk_promotion = e.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND a.b_type = 2
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        GROUP BY c.i_code, a.i_price, IFNULL(d.fk_promotion,0), IFNULL(d.i_promotionnominal,0)
                    ) AS \`temp\`
                    ORDER BY ${order_column} ${order_type}
                    ${limit ? 
                    `LIMIT ${limit}`
                    : ``};`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportSalesProductV3', resolve)
    })
}

export function getReportSalesProductSimple({res, connection}: typeGlobal.functions, {dt_paid, fk_business}: {dt_paid: {date_start: string, date_end: string}, fk_business: number}, {limit}: {limit?: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`sku\`,
                        CASE
                            WHEN \`promotion\` IS NOT NULL THEN CONCAT(\`item\`, ' (', \`promotion\`, ')')
                            ELSE \`item\`
                        END AS \`item\`,
                        \`item\` AS \`item_name\`,
                        \`total\`,
                        \`price\`,
                        CASE
                            WHEN \`promotion\` IS NOT NULL THEN \`totalafterpromotionqty\`
                            ELSE \`total_price\`
                        END AS \`total_price\`,
                        \`sku\` AS \`item_code\`,
                        \`promotionName\` AS \`promotion_name\`,
                        IFNULL(\`promotionnominal\`, 0) AS \`promotion_nominal\`
                    FROM
                    (
                        SELECT
                            c.v_code AS \`sku\`,
                            c.v_name AS \`item\`,
                            SUM(a.i_qty) AS \`total\`,
                            SUM(a.i_qty * a.i_price) AS \`total_price\`,
                            a.i_price AS \`price\`,
                            g.v_name AS \`promotion\`,
                            IFNULL(g.v_name, '') AS \`promotionName\`,
                            CASE
                                WHEN IFNULL(f.fk_promotion,0) = 3 THEN IFNULL(f.i_promotionnominal,0) / a.i_qty
                                ELSE f.i_promotionnominal
                            END AS \`promotionnominal\`,
                            CASE
                                WHEN IFNULL(f.fk_promotion,0) = 3 THEN ((a.i_price - IFNULL(f.i_promotionnominal,0) / a.i_qty)* SUM(a.i_qty))
                                ELSE ((a.i_price - IFNULL(f.i_promotionnominal,0))* SUM(a.i_qty))
                            END AS \`totalafterpromotionqty\`
                        FROM (
                            SELECT DISTINCT aa.i_code AS \`code\`
                            FROM dvw_transaction.vw_transaction aa
                            JOIN dvw_transaction.vw_transactionpayment bb ON aa.i_code = bb.fk_transaction
                            WHERE aa.fk_business = ${fk_business}
                                AND aa.b_ispaid = 1 
                                AND aa.b_isactive = 1 
                                AND aa.b_isvoid = 0
                                AND DATE_FORMAT(aa.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                                AND DATE_FORMAT(aa.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        ) z
                        JOIN dvw_transaction.vw_transactiondetail a ON z.code = a.fk_transaction
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1 AND b.b_isvoid = 0
                        JOIN dvw_master.vw_item c ON a.fk_item = c.i_code
                        LEFT JOIN dvw_transaction.vw_transactionpromotiondetail f ON a.i_code  = f.fk_transactiondetail
                        LEFT JOIN dvw_master.vw_promotion g ON f.fk_promotion = g.i_code
                        WHERE b.fk_business = ${fk_business}
                            AND a.b_isvoid = 0
                            AND a.b_type = 1
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        GROUP BY c.i_code, a.fk_unit, a.i_price, IFNULL(f.fk_promotion,0)
                    ) AS \`temp\`
                    ${limit ?
                    `LIMIT ${limit}`
                    :``};`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportSalesproductSimple', resolve)
    })
}

type getReportSalesProductHPP = { 
    name: string, 
    qty: string, 
    hpp: string, 
    total: string, 
    item_code: string, 
    item: string, 
    item_name: string, 
    category: string
}
export function getReportSalesProductHPP({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}): Promise<Array<getReportSalesProductHPP>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        b.v_name AS \`name\`,
                        SUM(c.i_qty) AS \`qty\`,
                        c.i_pricenet AS \`hpp\`,
                        SUM(c.i_qty) * c.i_pricenet AS \`total\`,
                        b.v_code AS \`item_code\`,
                        b.i_code AS \`item\`,
                        b.v_name AS \`item_name\`,
                        HEX(d.v_name) AS \`category\`
                    FROM dvw_transaction.vw_transaction a
                    JOIN dvw_transaction.vw_transactiondetail c ON c.fk_transaction = a.i_code
                    JOIN dvw_master.vw_item b ON c.fk_item = b.i_code
                    JOIN dvw_master.vw_category d ON b.fk_category = d.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.date_start}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                        AND a.b_isvoid = 0
                        AND c.b_isvoid = 0
                    GROUP BY c.fk_item, c.i_pricenet
                    ORDER BY SUBSTR(b.v_name, INSTR(b.v_name, 'by'));`
        functionGlobal.query(query, res, connection, 'function/transaction/getReportSalesProductHPP', resolve)
    })
}

export async function getReportDaySummary({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        DAYOFWEEK(a.dt_paid) AS \`day_number\`,
                        DAYNAME(a.dt_paid) AS \`day\`,
                        COUNT(1) AS \`qty\`,
                        SUM(a.i_totalnet) AS \`total\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.b_isvoid = 0
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                    GROUP BY DAYOFWEEK(a.dt_paid);`
        functionGlobal.query(query, res, connection, 'function/transaction/getReportDaySummary', resolve)
    })
}

export async function getReportHourSummary({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query  =`SELECT
                        CONCAT((CONCAT(HOUR(a.dt_paid), ':00 - ')), (CONCAT(HOUR(a.dt_paid)+1, ':00')))  AS \`hour\`,
                        COUNT(1) AS \`qty\`,
                        SUM(a.i_totalnet) AS \`total\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.b_isvoid = 0
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                    GROUP BY HOUR(a.dt_paid);`
        functionGlobal.query(query, res, connection, 'function/transaction/getReportHourSummary', resolve)
    })
}

export function getReportHour ({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        CONCAT((CONCAT(HOUR(a.dt_paid), ':00 - ')), (CONCAT(HOUR(a.dt_paid)+1, ':00')))  AS hour,
                        COUNT(1) AS qty,
                        SUM(a.i_total) AS total,
                        SUM(a.i_total) / COUNT(1) AS average,
                        SUM(a.i_totalnet) AS totalnet,
                        SUM(a.i_totalnet) / COUNT(1) AS averagenet
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.b_isvoid = 0
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                    GROUP BY HOUR(a.dt_paid);`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportHour', resolve)
    })
}

export function getReportRevenue({res, connection}: typeGlobal.functions, {fk_business, dt_paid, v_paidby, v_createdby, vw_customer, vw_invoicepayment}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, v_paidby: string, v_createdby: string, vw_customer: {v_name: string}, vw_invoicepayment: {dt_paid: {date_start: string, date_end: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`total_sales_item\`,
                        \`total_sales_item_complete\`,
                        \`total_sales_additional\`,
                        \`total_sales_additional_complete\`,
                        \`total_promotion_discount\`,
                        \`total_promotion_discount_complete\`,
                        \`total_promotion_voucher\`,
                        \`total_promotion_voucher_complete\`,
                        \`total_promotion_compliment\`,
                        \`total_promotion_compliment_complete\`,
                        \`tax\`,
                        \`tax_complete\`,
                        \`sc\`,
                        \`sc_complete\`,
                        \`rounded\`,
                        \`total_invoice\`,
                        IFNULL((
                            SELECT SUM(y.i_totalpaid)
                            FROM dvw_operational.vw_invoicepayment y
                            WHERE y.fk_business = \`business\`
                            AND DATE_FORMAT(y.dt_paid, '%Y-%m-%d') >= ${vw_invoicepayment.dt_paid.date_start}
                            AND DATE_FORMAT(y.dt_paid, '%Y-%m-%d') <= ${vw_invoicepayment.dt_paid.date_end}
                        ), 0) + \`total_invoice_paid\` AS \`total_invoice_paid\`,
                        \`total_cogs_item\`,
                        \`total_cogs_additional\`,
                        \`pph23\`,
                        \`transaction\`
                    FROM
                    (
                        SELECT
                            \`business\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_sales_item\`,0)
                                ELSE 0
                            END),0) AS \`total_sales_item\`,
                            IFNULL(SUM(\`total_sales_item\`),0) AS \`total_sales_item_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_sales_additional\`,0)
                                ELSE 0
                            END),0) AS \`total_sales_additional\`,
                            IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_discount\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_discount\`,
                            IFNULL(SUM(\`total_promotion_discount\`),0) AS \`total_promotion_discount_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_voucher\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_voucher\`,
                            IFNULL(SUM(\`total_promotion_voucher\`),0) AS \`total_promotion_voucher_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_compliment\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_compliment\`,
                            IFNULL(SUM(\`total_promotion_compliment\`),0) AS \`total_promotion_compliment_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`tax\`,0)
                                ELSE 0
                            END),0) AS \`tax\`,
                            IFNULL(SUM(\`tax\`),0) AS \`tax_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`sc\`,0)
                                ELSE 0
                            END),0) AS \`sc\`,
                            IFNULL(SUM(\`sc\`),0) AS \`sc_complete\`,
                            IFNULL(SUM(\`rounded\`),0) AS \`rounded\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 1 THEN IFNULL(\`total_net\`,0)
                                ELSE 0
                            END),0) AS \`total_invoice\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 1 THEN IFNULL(\`total_invoice_paid\`,0)
                                ELSE 0
                            END),0) AS \`total_invoice_paid\`,
                            IFNULL(SUM(\`total_cogs_item\`),0) AS \`total_cogs_item\`,
                            IFNULL(SUM(\`total_cogs_additional\`),0) AS \`total_cogs_additional\`,
                            IFNULL(SUM(\`pph23\`),0) AS \`pph23\`,
                            COUNT(1) AS \`transaction\`
                        FROM
                        (
                            SELECT 
                                a.fk_business AS \`business\`,
                                SUM(c.i_price * c.i_qty) AS \`total_sales_item\`,
                                SUM((
                                    SELECT SUM(z.i_price * z.i_qty)
                                    FROM dvw_transaction.vw_transactionadditional z
                                    WHERE z.fk_transactiondetail = c.i_code
                                ) * c.i_qty) AS \`total_sales_additional\`,
                                SUM(IF(h.fk_systempromotion = 1, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 1, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_discount\`,
                                SUM(IF(h.fk_systempromotion = 2, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 2, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_voucher\`,
                                SUM(IF(h.fk_systempromotion = 3, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 3, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_compliment\`,
                                (a.i_vatnominal) AS \`tax\`,
                                (a.i_scnominal) AS sc,
                                (a.i_rounded) AS \`rounded\`,
                                SUM(c.i_pricenet * c.i_qty) AS \`total_cogs_item\`,
                                SUM((
                                    SELECT SUM(z.i_pricenet * z.i_qty)
                                    FROM dvw_transaction.vw_transactionadditional z
                                    WHERE z.fk_transactiondetail = c.i_code
                                ) * c.i_qty) AS \`total_cogs_additional\`,
                                IFNULL((
                                    SELECT 1
                                    FROM dvw_operational.vw_invoice y
                                    WHERE y.fk_transaction = a.i_code
                                    GROUP BY y.fk_business
                                ),0) AS \`use_invoice\`,
                                a.i_totalnet AS total_net,
                                (
                                    SELECT SUM(y.i_paidmoney)
                                    FROM dvw_transaction.vw_transactionpayment y
                                    JOIN dvw_master.vw_paymentmethod x ON x.i_code = y.fk_paymentmethod AND x.fk_systempaymentmethod <> 4
                                    WHERE y.fk_transaction = a.i_code
                                ) AS \`total_invoice_paid\`,
                                SUM(a.i_pph23) AS \`pph23\`,
                                COUNT(a.i_code) AS \`transaction\`
                            FROM dvw_transaction.vw_transaction a
                            LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                            LEFT JOIN dvw_transaction.vw_transactiondetail c ON a.i_code = c.fk_transaction AND c.b_isactive = 1 AND c.b_isvoid = 0
                            LEFT JOIN dvw_transaction.vw_transactionpromotiondetail g ON c.i_code = g.fk_transactiondetail
                            LEFT JOIN dvw_master.vw_promotion h ON g.fk_promotion = h.i_code
                            LEFT JOIN dvw_transaction.vw_transactionpromotion i ON i.fk_transaction = a.i_code
                            LEFT JOIN dvw_master.vw_promotion j ON i.fk_promotion = j.i_code
                            WHERE
                                a.fk_business = ${fk_business}
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                                AND IFNULL(b.v_name,'') LIKE '${vw_customer.v_name}'
                                AND a.v_paidby LIKE '${v_paidby}'
                                AND a.v_createdby LIKE '${v_createdby}'
                                AND a.b_isactive = 1
                                AND a.b_isvoid = 0
                            GROUP BY a.i_code
                        ) AS temp
                    ) AS temp1;`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transaction/getReportRevenue', resolve)
    })
}

export function getReportConsolidationRevenue({res, connection}: typeGlobal.functions, {dt_paid, v_paidby, v_createdby, vw_business, vw_customer, vw_invoicepayment}: {dt_paid: {date_start: string, date_end: string}, v_paidby: string, v_createdby: string, vw_business: {fk_businessowner: number}, vw_customer: {v_name: string}, vw_invoicepayment: {dt_paid: {date_start: string, date_end: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`total_sales_item\`,
                        \`total_sales_item_complete\`,
                        \`total_sales_additional\`,
                        \`total_sales_additional_complete\`,
                        \`total_promotion_discount\`,
                        \`total_promotion_discount_complete\`,
                        \`total_promotion_voucher\`,
                        \`total_promotion_voucher_complete\`,
                        \`total_promotion_compliment\`,
                        \`total_promotion_compliment_complete\`,
                        \`tax\`,
                        \`tax_complete\`,
                        \`sc\`,
                        \`sc_complete\`,
                        \`total_invoice\`,
                        IFNULL((
                            SELECT SUM(y.i_totalpaid)
                            FROM dvw_operational.vw_invoicepayment y
                            WHERE y.fk_business = \`business\`
                            AND DATE_FORMAT(y.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                            AND DATE_FORMAT(y.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                        ), 0) + \`total_invoice_paid\` AS \`total_invoice_paid\`,
                        \`total_cogs_item\`,
                        \`total_cogs_additional\`,
                        \`pph23\`,
                        \`transaction\`
                    FROM
                    (
                        SELECT
                            \`business\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_sales_item\`,0)
                                ELSE 0
                            END),0) AS \`total_sales_item\`,
                            IFNULL(SUM(\`total_sales_item\`),0) AS \`total_sales_item_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_sales_additional\`,0)
                                ELSE 0
                            END),0) AS \`total_sales_additional\`,
                            IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_discount\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_discount\`,
                            IFNULL(SUM(\`total_promotion_discount\`),0) AS \`total_promotion_discount_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_voucher\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_voucher\`,
                            IFNULL(SUM(\`total_promotion_voucher\`),0) AS \`total_promotion_voucher_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_compliment\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_compliment\`,
                            IFNULL(SUM(\`total_promotion_compliment\`),0) AS \`total_promotion_compliment_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`tax\`,0)
                                ELSE 0
                            END),0) AS \`tax\`,
                            IFNULL(SUM(\`tax\`),0) AS \`tax_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`sc\`,0)
                                ELSE 0
                            END),0) AS \`sc\`,
                            IFNULL(SUM(\`sc\`),0) AS \`sc_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 1 THEN IFNULL(\`total_net\`,0)
                                ELSE 0
                            END),0) AS \`total_invoice\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 1 THEN IFNULL(\`total_invoice_paid\`,0)
                                ELSE 0
                            END),0) AS \`total_invoice_paid\`,
                            IFNULL(SUM(\`total_cogs_item\`),0) AS \`total_cogs_item\`,
                            IFNULL(SUM(\`total_cogs_additional\`),0) AS \`total_cogs_additional\`,
                            IFNULL(SUM(\`pph23\`),0) AS \`pph23\`,
                            COUNT(1) AS \`transaction\`
                        FROM
                        (
                            SELECT 
                                a.fk_business AS \`business\`,
                                SUM(c.i_price * c.i_qty) AS \`total_sales_item\`,
                                SUM((
                                    SELECT SUM(z.i_price * z.i_qty)
                                    FROM dvw_transaction.vw_transactionadditional z
                                    WHERE z.fk_transactiondetail = c.i_code
                                ) * c.i_qty) AS \`total_sales_additional\`,
                                SUM(IF(h.fk_systempromotion = 1, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 1, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_discount\`,
                                SUM(IF(h.fk_systempromotion = 2, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 2, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_voucher\`,
                                SUM(IF(h.fk_systempromotion = 3, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 3, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_compliment\`,
                                (a.i_vatnominal) AS \`tax\`,
                                (a.i_scnominal) AS sc,
                                SUM(c.i_pricenet * c.i_qty) AS \`total_cogs_item\`,
                                SUM((
                                    SELECT SUM(z.i_pricenet * z.i_qty)
                                    FROM dvw_transaction.vw_transactionadditional z
                                    WHERE z.fk_transactiondetail = c.i_code
                                ) * c.i_qty) AS \`total_cogs_additional\`,
                                IFNULL((
                                    SELECT 1
                                    FROM dvw_operational.vw_invoice y
                                    WHERE y.fk_transaction = a.i_code
                                    GROUP BY y.fk_business
                                ),0) AS \`use_invoice\`,
                                a.i_totalnet AS total_net,
                                (
                                    SELECT SUM(y.i_paidmoney)
                                    FROM dvw_transaction.vw_transactionpayment y
                                    JOIN dvw_master.vw_paymentmethod x ON x.i_code = y.fk_paymentmethod AND x.fk_systempaymentmethod <> 4
                                    WHERE y.fk_transaction = a.i_code
                                ) AS \`total_invoice_paid\`,
                                SUM(a.i_pph23) AS \`pph23\`,
                                COUNT(a.i_code) AS \`transaction\`
                            FROM dvw_transaction.vw_transaction a
                            LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                            LEFT JOIN dvw_transaction.vw_transactiondetail c ON a.i_code = c.fk_transaction AND c.b_isactive = 1 AND c.b_isvoid = 0
                            LEFT JOIN dvw_transaction.vw_transactionpromotiondetail g ON c.i_code = g.fk_transactiondetail
                            LEFT JOIN dvw_master.vw_promotion h ON g.fk_promotion = h.i_code
                            LEFT JOIN dvw_transaction.vw_transactionpromotion i ON i.fk_transaction = a.i_code
                            LEFT JOIN dvw_master.vw_promotion j ON i.fk_promotion = j.i_code
                            JOIN dvw_account.vw_business z ON a.fk_business = z.i_code
                            WHERE
                                z.fk_businessowner = ${vw_business.fk_businessowner}
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                                AND IFNULL(b.v_name,'') LIKE '${vw_customer.v_name}'
                                AND a.v_paidby LIKE '${v_paidby}'
                                AND a.v_createdby LIKE '${v_createdby}'
                                AND a.b_ispaid = 1
                                AND a.b_isactive = 1
                                AND a.b_isvoid = 0
                            GROUP BY a.i_code
                        ) AS temp
                    ) AS temp1;`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transaction/getReportConsolidationRevenue', resolve)
    })
}

export function getReportSpecialRevenue({res, connection}: typeGlobal.functions, {dt_paid, vw_invoicepayment, vw_business_user}: {dt_paid: {date_start: string, date_end: string}, vw_invoicepayment: {dt_paid: {date_start: string, date_end: string}}, vw_business_user: {fk_user: number}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`total_sales_item\`,
                        \`total_sales_item_complete\`,
                        \`total_sales_additional\`,
                        \`total_sales_additional_complete\`,
                        \`total_promotion_discount\`,
                        \`total_promotion_discount_complete\`,
                        \`total_promotion_voucher\`,
                        \`total_promotion_voucher_complete\`,
                        \`total_promotion_compliment\`,
                        \`total_promotion_compliment_complete\`,
                        \`tax\`,
                        \`tax_complete\`,
                        \`sc\`,
                        \`sc_complete\`,
                        \`total_invoice\`,
                        IFNULL((
                            SELECT SUM(y.i_totalpaid)
                            FROM dvw_operational.vw_invoicepayment y
                            WHERE y.fk_business = \`business\`
                            AND DATE_FORMAT(y.dt_paid, '%Y-%m-%d') >= '${vw_invoicepayment.dt_paid.date_start}'
                            AND DATE_FORMAT(y.dt_paid, '%Y-%m-%d') <= '${vw_invoicepayment.dt_paid.date_end}'
                        ), 0) + \`total_invoice_paid\` AS \`total_invoice_paid\`,
                        \`total_cogs_item\`,
                        \`total_cogs_additional\`,
                        \`pph23\`,
                        \`transaction\`
                    FROM
                    (
                        SELECT
                            \`business\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_sales_item\`,0)
                                ELSE 0
                            END),0) AS \`total_sales_item\`,
                            IFNULL(SUM(\`total_sales_item\`),0) AS \`total_sales_item_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_sales_additional\`,0)
                                ELSE 0
                            END),0) AS \`total_sales_additional\`,
                            IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_discount\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_discount\`,
                            IFNULL(SUM(\`total_promotion_discount\`),0) AS \`total_promotion_discount_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_voucher\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_voucher\`,
                            IFNULL(SUM(\`total_promotion_voucher\`),0) AS \`total_promotion_voucher_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`total_promotion_compliment\`,0)
                                ELSE 0
                            END),0) AS \`total_promotion_compliment\`,
                            IFNULL(SUM(\`total_promotion_compliment\`),0) AS \`total_promotion_compliment_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`tax\`,0)
                                ELSE 0
                            END),0) AS \`tax\`,
                            IFNULL(SUM(\`tax\`),0) AS \`tax_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 0 THEN IFNULL(\`sc\`,0)
                                ELSE 0
                            END),0) AS \`sc\`,
                            IFNULL(SUM(\`sc\`),0) AS \`sc_complete\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 1 THEN IFNULL(\`total_net\`,0)
                                ELSE 0
                            END),0) AS \`total_invoice\`,
                            IFNULL(SUM(CASE
                                WHEN \`use_invoice\` = 1 THEN IFNULL(\`total_invoice_paid\`,0)
                                ELSE 0
                            END),0) AS \`total_invoice_paid\`,
                            IFNULL(SUM(\`total_cogs_item\`),0) AS \`total_cogs_item\`,
                            IFNULL(SUM(\`total_cogs_additional\`),0) AS \`total_cogs_additional\`,
                            IFNULL(SUM(\`pph23\`),0) AS \`pph23\`,
                            COUNT(1) AS \`transaction\`
                        FROM
                        (
                            SELECT 
                                a.fk_business AS \`business\`,
                                SUM(c.i_price * c.i_qty) AS \`total_sales_item\`,
                                SUM((
                                    SELECT SUM(z.i_price * z.i_qty)
                                    FROM dvw_transaction.vw_transactionadditional z
                                    WHERE z.fk_transactiondetail = c.i_code
                                ) * c.i_qty) AS \`total_sales_additional\`,
                                SUM(IF(h.fk_systempromotion = 1, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 1, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_discount\`,
                                SUM(IF(h.fk_systempromotion = 2, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 2, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_voucher\`,
                                SUM(IF(h.fk_systempromotion = 3, IFNULL(g.i_promotionnominal,0) * c.i_qty, 0)) + (IF(j.fk_systempromotion = 3, IFNULL(i.i_promotionnominal,0), 0)) AS \`total_promotion_compliment\`,
                                (a.i_vatnominal) AS \`tax\`,
                                (a.i_scnominal) AS sc,
                                SUM(c.i_pricenet * c.i_qty) AS \`total_cogs_item\`,
                                SUM((
                                    SELECT SUM(z.i_pricenet * z.i_qty)
                                    FROM dvw_transaction.vw_transactionadditional z
                                    WHERE z.fk_transactiondetail = c.i_code
                                ) * c.i_qty) AS \`total_cogs_additional\`,
                                IFNULL((
                                    SELECT 1
                                    FROM dvw_operational.vw_invoice y
                                    WHERE y.fk_transaction = a.i_code
                                    GROUP BY y.fk_business
                                ),0) AS \`use_invoice\`,
                                a.i_totalnet AS total_net,
                                (
                                    SELECT SUM(y.i_paidmoney)
                                    FROM dvw_transaction.vw_transactionpayment y
                                    JOIN dvw_master.vw_paymentmethod x ON x.i_code = y.fk_paymentmethod AND x.fk_systempaymentmethod <> 4
                                    WHERE y.fk_transaction = a.i_code
                                ) AS \`total_invoice_paid\`,
                                SUM(a.i_pph23) AS \`pph23\`,
                                COUNT(a.i_code) AS \`transaction\`
                            FROM dvw_transaction.vw_transaction a
                            LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                            LEFT JOIN dvw_transaction.vw_transactiondetail c ON a.i_code = c.fk_transaction AND c.b_isactive = 1 AND c.b_isvoid = 0
                            LEFT JOIN dvw_transaction.vw_transactionpromotiondetail g ON c.i_code = g.fk_transactiondetail
                            LEFT JOIN dvw_master.vw_promotion h ON g.fk_promotion = h.i_code
                            LEFT JOIN dvw_transaction.vw_transactionpromotion i ON i.fk_transaction = a.i_code
                            LEFT JOIN dvw_master.vw_promotion j ON i.fk_promotion = j.i_code
                            JOIN dvw_account.vw_business_user z ON a.fk_business = z.fk_business
                            WHERE
                                z.fk_user = ${vw_business_user.fk_user}
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                                AND a.b_ispaid = 1
                                AND a.b_isactive = 1
                                AND a.b_isvoid = 0
                            GROUP BY a.i_code
                        ) AS temp
                    ) AS temp1;`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transaction/getReportSpecialRevenue', resolve)
    })
}

export function getReportCustomerHistoryTransaction({res, connection}: typeGlobal.functions, {fk_business, fk_customer, dt_paid}: {fk_business: number, fk_customer: number, dt_paid: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.s_offlinecode AS \`receipt\`,
                        IFNULL(a.v_guest, '') AS 'notes',
                        a.dt_paid AS 'date_paid',
                        a.i_totalnet AS \`total_net\`,
                        IFNULL(a.i_totalpromotion, '0') AS \`total_promotion\`,
                        IFNULL(e.v_name, '') AS \`promotion\`,
                        a.b_isvoid AS \`void\`,
                        IFNULL(c.v_name, '') AS \`salestype\`,
                        GROUP_CONCAT(g.v_name ORDER BY g.v_name ASC SEPARATOR ', ') AS \`payment\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpromotion d ON a.i_code = d.fk_transaction
                    LEFT JOIN dvw_master.vw_promotion e ON d.fk_promotion = e.i_code
                    LEFT JOIN dvw_transaction.vw_transactionpayment f ON a.i_code = f.fk_transaction
                    LEFT JOIN dvw_master.vw_paymentmethod g ON g.i_code = f.fk_paymentmethod
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.fk_customer = ${fk_customer}
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.date_start}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.date_end}'
                    GROUP BY a.i_code`
        functionGlobal.query(query, res, connection, "function/transaction/transaction/getReportCustomerHistoryTransaction", resolve)
    })
}

type getReportReceive = {
    code: any,
    receipt: any,
    customer_code: any,
    customer_name: any,
    guest: any,
    order_receiver: any,
    date_order: any,
    date_paid: any,
    date_receive: any,
    total_net: any,
    receive_notes: any,
    receive_photo: any
}
export function getReportReceive({res, connection}: typeGlobal.functions, {fk_business, dt_receive, vw_customer}: {fk_business: number, dt_receive: {date_start: string, date_end: string}, vw_customer: {v_name: string}}): Promise<Array<getReportReceive>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS code,
                        a.s_offlinecode AS receipt,
                        IFNULL(b.i_code, 0) AS customer_code,
                        IFNULL(b.v_name, '') AS customer_name,
                        IFNULL(a.v_guest, '') AS guest,
                        '' AS order_receiver,
                        a.dt_created AS date_order,
                        a.dt_paid AS date_paid,
                        a.dt_receive AS date_receive,
                        a.i_totalnet AS total_net,
                        a.v_receivenotes AS receive_notes,
                        a.v_receivephoto AS receive_photo
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND IFNULL(b.v_name, '') LIKE '${vw_customer.v_name}'
                        AND DATE_FORMAT(a.dt_receive, '%Y-%m-%d') >= '${dt_receive.date_start}'
                        AND DATE_FORMAT(a.dt_receive, '%Y-%m-%d') <= '${dt_receive.date_end}'
                        AND a.dt_receive IS NOT NULL
                    GROUP BY a.i_code;`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportReceive', resolve)
    })
}

type getReportSalesProductDetailReceipt = {
    code: number,
    order_number: number,
    offlinecode: string,
    customer_email: string,
    customer_code: number,
    customer_name: string,
    guest: string,
    order_server: string,
    order_cashier: string,
    order_date: string,
    total: number,
    tax: number,
    sc: number,
    total_promotion: number,
    total_net: number,
    changes: number,
    void: number,
    salestype_code: number,
    salestype_name: string
}
export function getReportSalesProductDetailReceipt({res, connection}: typeGlobal.functions, {s_offlinecode}: {s_offlinecode: string}): Promise<getReportSalesProductDetailReceipt> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.i_ordernumber AS \`order_number\`,
                        a.s_offlinecode AS \`offlinecode\`,
                        a.v_email AS \`customer_email\`,
                        IFNULL(b.i_code, 0) AS \`customer_code\`,
                        IFNULL(b.v_name, '') AS \`customer_name\`,
                        IFNULL(a.v_guest, '') AS \`guest\`,
                        a.v_createdby AS \`order_server\`,
                        a.v_paidby AS \`order_cashier\`,
                        a.dt_paid AS \`order_date\`,
                        a.i_total AS \`total\`,
                        a.i_vatnominal AS \`tax\`,
                        a.i_scnominal AS \`sc\`,
                        a.i_totalpromotion AS \`total_promotion\`,
                        a.i_totalnet AS \`total_net\`,
                        a.i_changes AS \`changes\`,
                        a.b_isvoid AS \`void\`,
                        a.fk_salestype AS \`salestype_code\`,
                        c.v_name AS \`salestype_name\`
                    FROM dvw_transaction.vw_transaction a
                    LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                    WHERE a.b_isactive = 1
                        AND a.s_offlinecode = '${s_offlinecode}'`
        functionGlobal.querySingle(query, res, connection, 'controller/transaction/getReportSalesProductDetailReceipt', resolve)
    })
}

type getReportDashboard = {
    total_transaction: number,
    total_nominal: number
}
export function getReportDashboard({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getReportDashboard> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        COUNT(1) AS \`total_transaction\`,
                        SUM(a.i_totalnet) AS \`total_nominal\`
                    FROM dvw_transaction.vw_transaction a
                    WHERE a.fk_business = :business
                        AND DATE(a.dt_paid) = DATE(NOW())
                        AND a.b_isvoid = 0
                        AND a.b_isactive = 1
                    GROUP BY DATE(a.dt_paid)`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/transaction/getReportDashboard', resolve)
    })
}

type getSalesReportToday = {
    total_sales_item: any,
    total_sales_additional: any,
    total_promotion: any,
    tax: any,
    sc: any,
    total_cogs_item: any,
    total_cogs_additional: any,
    total_void: any,
    transaction: any,
    void: any
}
export function getSalesReportToday({res, connection}: typeGlobal.functions, {fk_business, v_paidby}: {fk_business: number, v_paidby: string}): Promise<Array<getSalesReportToday>> {
    return new Promise((resolve, reject) => {
        let query = `
                        SELECT
                            COALESCE(SUM(\`total_sales_item\`), 0) AS \`total_sales_item\`,
                            COALESCE(SUM(\`total_sales_additional\`), 0) AS \`total_sales_additional\`,
                            COALESCE(SUM(\`total_promotion\`), 0) AS \`total_promotion\`,
                            COALESCE(SUM(\`tax\`), 0) AS \`tax\`,
                            COALESCE(SUM(\`sc\`), 0) AS \`sc\`,
                            COALESCE(SUM(\`total_cogs_item\`), 0) AS \`total_cogs_item\`,
                            COALESCE(SUM(\`total_cogs_additional\`), 0) AS \`total_cogs_additional\`,
                            COALESCE(SUM(\`total_void\`), 0) AS \`total_void\`,
                            COALESCE(SUM(\`transaction\`), 0) AS \`transaction\`,
                            COALESCE(SUM(\`void\`), 0) AS \`void\`
                        FROM
                        (
                            SELECT
                                COALESCE(SUM(\`total_sales_item\`),0) AS \`total_sales_item\`,
                                COALESCE(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional\`,
                                COALESCE(SUM(\`total_promotion\`),0) +
                                CASE
                                    WHEN z.b_isvoid = 0 THEN (IFNULL(y.i_promotionnominal,0))
                                    ELSE 0
                                END AS \`total_promotion\`,
                                CASE
                                    WHEN z.b_isvoid = 0 THEN z.i_vatnominal
                                    ELSE 0
                                END AS \`tax\`,
                                CASE
                                    WHEN z.b_isvoid = 0 THEN z.i_scnominal
                                    ELSE 0
                                END AS \`sc\`,
                                COALESCE(SUM(\`total_cogs_item\`),0) AS \`total_cogs_item\`,
                                COALESCE(SUM(\`total_cogs_additional\`),0) AS \`total_cogs_additional\`,
                                COALESCE(SUM(\`void_total_sales_item\`),0) 
                                    + COALESCE(SUM(\`void_total_sales_additional\`),0) 
                                    - COALESCE(SUM(\`void_total_promotion\`),0) 
                                    + CASE
                                            WHEN z.b_isvoid = 1 THEN z.i_vatnominal
                                            ELSE 0
                                        END
                                    + CASE
                                            WHEN z.b_isvoid = 1 THEN z.i_scnominal
                                            ELSE 0
                                        END
                                    AS \`total_void\`,
                                CASE
                                    WHEN z.b_isvoid = 0 THEN 1
                                    ELSE 0
                                END AS \`transaction\`,
                                CASE
                                    WHEN z.b_isvoid = 1 THEN 1
                                    ELSE 0
                                END AS \`void\`
                            FROM
                            (
                                SELECT 
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN SUM(c.i_price * c.i_qty)
                                    END AS \`total_sales_item\`,
                                    CASE
                                        WHEN a.b_isvoid = 1 OR c.b_isvoid = 1 THEN SUM(c.i_price * c.i_qty)
                                    END AS \`void_total_sales_item\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN
                                        SUM((
                                            SELECT SUM(z.i_price * z.i_qty)
                                            FROM dvw_transaction.vw_transactionadditional z
                                            WHERE z.fk_transactiondetail = c.i_code
                                        ) * c.i_qty)
                                    END AS \`total_sales_additional\`,
                                    CASE
                                        WHEN a.b_isvoid = 1 OR c.b_isvoid = 1 THEN
                                        SUM((
                                            SELECT SUM(z.i_price * z.i_qty)
                                            FROM dvw_transaction.vw_transactionadditional z
                                            WHERE z.fk_transactiondetail = c.i_code
                                        ) * c.i_qty)
                                    END AS \`void_total_sales_additional\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 AND h.fk_systempromotion<3 THEN SUM(IFNULL(g.i_promotionnominal,0) * c.i_qty)
                                    END AS \`total_promotion\`,
                                    CASE
                                        WHEN a.b_isvoid = 1 OR c.b_isvoid = 1 AND h.fk_systempromotion<3 THEN SUM(IFNULL(g.i_promotionnominal,0) * c.i_qty)
                                    END AS \`void_total_promotion\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN SUM(c.i_pricenet * c.i_qty)
                                    END AS \`total_cogs_item\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN
                                        SUM((
                                            SELECT SUM(z.i_pricenet * z.i_qty)
                                            FROM dvw_transaction.vw_transactionadditional z
                                            WHERE z.fk_transactiondetail = c.i_code
                                        ) * c.i_qty)
                                    END AS \`total_cogs_additional\`,
                                    a.i_code AS \`code\`
                                FROM dvw_transaction.vw_transaction a
                                LEFT JOIN dvw_transaction.vw_transactiondetail c ON a.i_code = c.fk_transaction AND c.b_isactive = 1
                                LEFT JOIN dvw_transaction.vw_transactionpromotiondetail g ON c.i_code = g.fk_transactiondetail
                                LEFT JOIN dvw_master.vw_promotion h ON h.i_code = g.fk_promotion
                                WHERE
                                    a.fk_business = ${fk_business}
                                    AND a.v_paidby like '${v_paidby}'
                                    AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') = DATE(NOW())
                                    AND a.b_ispaid = 1
                                    AND a.b_isactive = 1
                                GROUP BY c.i_code
                            ) AS temp
                            JOIN dvw_transaction.vw_transaction z ON temp.code = z.i_code
                            LEFT JOIN dvw_transaction.vw_transactionpromotion y ON temp.code = y.fk_transaction
                            GROUP BY z.i_code
                        ) AS temp;
                    `
        functionGlobal.query(query, res, connection, 'functioon/transaction/transaction/getSalesReportToday', resolve)
    })
}

type getSalesPaymentToday = {
    name: any,
    subtotal: any,
    changes: any,
    total: any
}
export function getSalesPaymentToday({res, connection}: typeGlobal.functions, {fk_business, v_paidby}: {fk_business: number, v_paidby: string}): Promise<Array<getSalesPaymentToday>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`name\` AS \`name\`,
                        SUM(\`total\`) AS \`subtotal\`,
                        SUM(\`changes\`) AS \`changes\`,
                        CASE
                            WHEN \`systempaymentmethod\` = 1 THEN SUM(\`total\`) - SUM(\`changes\`)
                            ELSE SUM(\`total\`)
                        END AS \`total\`,
                        \`systempaymentmethod\`
                    FROM
                    (
                        SELECT 
                            c.v_name AS \`name\`,
                            b.fk_paymentmethod AS \`paymentmethod\`,
                            SUM(b.i_paidmoney) AS \`total\`,
                            (a.i_changes) AS \`changes\`,
                            c.fk_systempaymentmethod AS \`systempaymentmethod\`
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactionpayment b ON b.fk_transaction = a.i_code
                        JOIN dvw_master.vw_paymentmethod c ON c.i_code = b.fk_paymentmethod
                        WHERE
                            a.fk_business = ${fk_business}
                            AND a.v_paidby LIKE '${v_paidby}'
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') = DATE(NOW())
                            AND a.b_ispaid = 1
                            AND a.b_isactive = 1
                            AND a.b_isvoid = 0
                        GROUP BY b.fk_paymentmethod, a.i_code
                    ) AS temp
                    GROUP BY \`paymentmethod\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getSalesPaymentToday', resolve)
    })
}

type getSalesReportLast7Days = {
    date: any,
    total_sales_item: any,
    total_sales_additional: any,
    total_promotion: any,
    tax: any,
    sc: any,
    total_cogs_item: any,
    total_cogs_additional: any,
    total_void: any,
    transaction: any,
    void: any
}
export function getSalesReportLast7Days({res, connection}: typeGlobal.functions, {fk_business, v_paidby}: {fk_business: number, v_paidby: string}): Promise<Array<getSalesReportLast7Days>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`date\`,
                        IFNULL(SUM(\`total_sales_item\`),0) AS \`total_sales_item\`,
                        IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional\`,
                        IFNULL(SUM(\`total_promotion\`),0) AS \`total_promotion\`,
                        IFNULL(SUM(\`tax\`),0) AS \`tax\`,
                        IFNULL(SUM(\`sc\`),0) AS \`sc\`,
                        IFNULL(SUM(\`total_cogs_item\`),0) AS \`total_cogs_item\`,
                        IFNULL(SUM(\`total_cogs_additional\`),0) AS \`total_cogs_additional\`,
                        IFNULL(SUM(\`total_void\`),0) AS \`total_void\`,
                        SUM(\`transaction\`)AS \`transaction\`,
                        SUM(\`void\`) AS \`void\`
                        FROM
                        (
                            SELECT
                                IFNULL(DATE(z.dt_paid), '0') AS \`date\`,
                                IFNULL(SUM(\`total_sales_item\`),0) AS \`total_sales_item\`,
                                IFNULL(SUM(\`total_sales_additional\`),0) AS \`total_sales_additional\`,
                                IFNULL(SUM(\`total_promotion\`),0) +
                                CASE
                                    WHEN z.b_isvoid = 0 THEN (IFNULL(y.i_promotionnominal,0))
                                    ELSE 0
                                END AS \`total_promotion\`,
                                CASE
                                    WHEN z.b_isvoid = 0 THEN z.i_vatnominal
                                    ELSE 0
                                END AS \`tax\`,
                                CASE
                                    WHEN z.b_isvoid = 0 THEN z.i_scnominal
                                    ELSE 0
                                END AS \`sc\`,
                                IFNULL(SUM(\`total_cogs_item\`),0) AS \`total_cogs_item\`,
                                IFNULL(SUM(\`total_cogs_additional\`),0) AS \`total_cogs_additional\`,
                                IFNULL(SUM(\`void_total_sales_item\`),0) 
                                    + IFNULL(SUM(\`void_total_sales_additional\`),0) 
                                    - IFNULL(SUM(\`void_total_promotion\`),0) 
                                    + CASE
                                            WHEN z.b_isvoid = 1 THEN z.i_vatnominal
                                            ELSE 0
                                        END
                                    + CASE
                                            WHEN z.b_isvoid = 1 THEN z.i_scnominal
                                            ELSE 0
                                        END
                                    AS \`total_void\`,
                                CASE
                                    WHEN z.b_isvoid = 0 THEN 1
                                    ELSE 0
                                END AS \`transaction\`,
                                CASE
                                    WHEN z.b_isvoid = 1 THEN 1
                                    ELSE 0
                                END AS \`void\`
                            FROM
                            (
                                SELECT 
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN SUM(c.i_price * c.i_qty)
                                    END AS \`total_sales_item\`,
                                    CASE
                                        WHEN a.b_isvoid = 1 OR c.b_isvoid = 1 THEN SUM(c.i_price * c.i_qty)
                                    END AS \`void_total_sales_item\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN
                                        SUM((
                                            SELECT SUM(z.i_price * z.i_qty)
                                            FROM dvw_transaction.vw_transactionadditional z
                                            WHERE z.fk_transactiondetail = c.i_code
                                        ) * c.i_qty)
                                    END AS \`total_sales_additional\`,
                                    CASE
                                        WHEN a.b_isvoid = 1 OR c.b_isvoid = 1 THEN
                                        SUM((
                                            SELECT SUM(z.i_price * z.i_qty)
                                            FROM dvw_transaction.vw_transactionadditional z
                                            WHERE z.fk_transactiondetail = c.i_code
                                        ) * c.i_qty)
                                    END AS \`void_total_sales_additional\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN SUM(IFNULL(g.i_promotionnominal,0) * c.i_qty)
                                    END AS \`total_promotion\`,
                                    CASE
                                        WHEN a.b_isvoid = 1 OR c.b_isvoid = 1 THEN SUM(IFNULL(g.i_promotionnominal,0) * c.i_qty)
                                    END AS \`void_total_promotion\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN SUM(c.i_pricenet * c.i_qty)
                                    END AS \`total_cogs_item\`,
                                    CASE
                                        WHEN a.b_isvoid = 0 AND c.b_isvoid = 0 THEN
                                        SUM((
                                            SELECT SUM(z.i_pricenet * z.i_qty)
                                            FROM dvw_transaction.vw_transactionadditional z
                                            WHERE z.fk_transactiondetail = c.i_code
                                        ) * c.i_qty)
                                    END AS \`total_cogs_additional\`,
                                    a.i_code AS \`code\`
                                FROM dvw_transaction.vw_transaction a
                                LEFT JOIN dvw_transaction.vw_transactiondetail c ON a.i_code = c.fk_transaction AND c.b_isactive = 1
                                LEFT JOIN dvw_transaction.vw_transactionpromotiondetail g ON c.i_code = g.fk_transactiondetail
                                WHERE
                                    a.fk_business = ${fk_business}
                                    AND a.v_paidby LIKE '${v_paidby}'
                                    AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= DATE(NOW())
                                    AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= (DATE(NOW()) - INTERVAL 6 DAY)
                                    AND a.b_ispaid = 1
                                    AND a.b_isactive = 1
                                GROUP BY c.i_code
                            ) AS temp
                            JOIN dvw_transaction.vw_transaction z ON temp.code = z.i_code
                            LEFT JOIN dvw_transaction.vw_transactionpromotion y ON temp.code = y.fk_transaction
                            GROUP BY z.i_code
                        ) AS temp
                        GROUP BY \`date\`;
                    `
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getSalesReportLast7Days', resolve)
    })
}

type getReportTicketSalesV3 = {
    receipt_code: string,
    customer_name: string,
    item_name: string,
    item_qty: number,
    date_checkin: string
}
export async function getReportTicketSalesV3({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<Array<getReportTicketSalesV3>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        a.s_offlinecode as receipt_code,
                        d.v_name as customer_name,
                        c.v_name as item_name,
                        b.i_qty as item_qty,
                        a.dt_checkin as date_checkin
                    FROM
                        dvw_transaction.vw_transaction a
                    JOIN
                        dvw_transaction.vw_transactiondetail b ON a.i_code = b.fk_transaction AND b.fk_business = ${fk_business} AND b.b_isactive = 1
                    JOIN
                        dvw_master.vw_item c ON b.fk_item = c.i_code AND c.fk_business = ${fk_business} AND c.b_isactive = 1
                    JOIN
                        dvw_master.vw_customer d ON a.fk_customer = d.i_code AND d.fk_business = ${fk_business} AND d.b_isactive = 1
                    WHERE
                        a.fk_business = ${fk_business}
                        AND a.b_isactive = 1
                        AND a.b_isvoid = 0
                    `
        if (fk_business === 7151)
        query = `
                SELECT
                    a.s_offlinecode as receipt_code,
                    d.v_name as customer_name,
                    c.v_name as item_name,
                    b.i_qty as item_qty,
                    a.dt_checkin as date_checkin
                FROM
                    dvw_transaction.vw_transaction a
                JOIN
                    dvw_transaction.vw_transactiondetail b ON a.i_code = b.fk_transaction AND (b.fk_business = ${fk_business} OR b.fk_business = 7152 ) AND b.b_isactive = 1
                JOIN
                    dvw_master.vw_item c ON b.fk_item = c.i_code AND (c.fk_business = ${fk_business} OR c.fk_business = 7152 ) AND c.b_isactive = 1
                JOIN
                    dvw_master.vw_customer d ON a.fk_customer = d.i_code AND (d.fk_business = ${fk_business} OR d.fk_business = 7152 ) AND d.b_isactive = 1
                WHERE
                    (a.fk_business = ${fk_business} OR a.fk_business = 7152)
                    AND a.b_isactive = 1
                    AND a.b_isvoid = 0
                `
        
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportTicketSalesV3', resolve)
    })
}

type getReportShiftPaymentMethod = {
    name: string,
    subtotal: string,
    changes: string,
    total: string,
    systempaymentmethod: string
}
export function getReportShiftPaymentMethod({res, connection}: typeGlobal.functions, {fk_business, dt_paid, v_paidby}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, v_paidby: string}): Promise<Array<getReportShiftPaymentMethod>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        \`name\` AS \`name\`,
                        SUM(\`total\`) AS \`subtotal\`,
                        SUM(\`changes\`) AS \`changes\`,
                        CASE
                            WHEN \`systempaymentmethod\` = 1 THEN SUM(\`total\`) - SUM(\`changes\`)
                            ELSE SUM(\`total\`)
                        END AS \`total\`,
                        \`systempaymentmethod\`
                    FROM
                    (
                        SELECT 
                            c.v_name AS \`name\`,
                            b.fk_paymentmethod AS \`paymentmethod\`,
                            SUM(b.i_paidmoney) AS \`total\`,
                            (a.i_changes) AS \`changes\`,
                            c.fk_systempaymentmethod AS \`systempaymentmethod\`
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactionpayment b ON b.fk_transaction = a.i_code
                        JOIN dvw_master.vw_paymentmethod c ON c.i_code = b.fk_paymentmethod
                        WHERE
                            a.fk_business = ${fk_business}
                            AND a.v_paidby like '${v_paidby}'
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_end}', '%Y-%m-%d %H:%i')
                            AND a.b_ispaid = 1
                            AND a.b_isactive = 1
                            AND a.b_isvoid = 0
                        GROUP BY b.fk_paymentmethod, a.i_code
                    ) AS temp
                    GROUP BY \`paymentmethod\`
                    ORDER BY \`systempaymentmethod\`;
                    `
        functionGlobal.query(query, res, connection, 'function/transaction/transaction/getReportShiftPaymentMethod', resolve)
    })
}