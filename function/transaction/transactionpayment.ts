import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type get = {
    name: string,
    value: string
}
export async function get({res, connection}: typeGlobal.functions,{receipt} : {receipt: string}): Promise<get[]> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT
                            c.v_name AS name,
                            b.i_paidmoney AS value
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactionpayment b ON a.i_code = b.fk_transaction
                        JOIN dvw_master.vw_paymentmethod c ON b.fk_paymentmethod = c.i_code
                        WHERE a.s_offlinecode = '${receipt}'
                        ORDER BY b.i_code ASC`

        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/get', resolve)
    })
}

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_transaction, fk_paymentmethod, paidmoney, 
        information
    }   : {
            fk_business: number, fk_transaction: number, 
            fk_paymentmethod: number, paidmoney: number, information: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_transactionpayment(fk_business, fk_transaction, fk_paymentmethod, i_paidmoney, v_information)
                    VALUES (${fk_business}, ${fk_transaction}, ${fk_paymentmethod}, ${paidmoney}, '${information}')`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/insert', resolve)
    })   
}

type getReportSales = {
    payment_method_code: number,
    payment_method_name: string,
    paid_money: number
}
export async function getReportSales({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSales>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_paymentmethod AS \`payment_method_code\`, 
                        b.v_name AS \`payment_method_name\`,
                        a.i_paidmoney AS \`paid_money\`
                    FROM dvw_transaction.vw_transactionpayment a
                    JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                    WHERE a.fk_transaction = ${fk_transaction}`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/getReportSales', resolve)
    })
}

type getReportSalesDetail = {
    payment_method_code: string,
    payment_method_name: string,
    paid_money: string
}
export function getReportSalesDetail({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSalesDetail>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_paymentmethod AS \`payment_method_code\`, 
                        b.v_name AS \`payment_method_name\`,
                        a.i_paidmoney AS \`paid_money\`
                    FROM dvw_transaction.vw_transactionpayment a
                    JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                    WHERE a.fk_transaction = ${fk_transaction}`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/getReportSalesDetail', resolve)
    })
}

export function getReportRevenue({res, connection}: typeGlobal.functions, {vw_transaction, vw_paymentmethod, vw_customer}: {vw_transaction: {fk_business: number, dt_paid: {date_start: string, date_end: string}, v_paidby: string, v_createdby: string}, vw_paymentmethod: {i_code: string}, vw_customer: {v_name: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`paymentmethod\`,
                        SUM(\`value\`) - SUM(\`changes\`) AS \`value\`,
                        SUM(\`mdr\`) AS \`mdr\`,
                        \`systempaymentmethod\`
                    FROM
                    (
                        SELECT
                            c.v_name AS \`paymentmethod\`,
                            a.i_paidmoney * a.i_mdr / 100 AS \`mdr\`,
                            a.i_paidmoney  AS \`value\`,
                            (
                                SELECT 
                                    CASE 
                                        WHEN e.i_code = a.i_code THEN b.i_changes
                                        ELSE 0
                                    END
                                FROM dvw_transaction.vw_transactionpayment e
                                WHERE e.fk_transaction = b.i_code
                                ORDER BY e.i_code DESC
                                LIMIT 1
                            ) AS \`changes\`,
                            IF(
                                (
                                    SELECT COUNT(1)
                                    FROM dvw_transaction.vw_transactionpayment z
                                    JOIN dvw_master.vw_paymentmethod y ON y.i_code = z.fk_paymentmethod
                                    WHERE z.fk_transaction = b.i_code
                                        AND y.fk_systempaymentmethod = 4
                                ) > 0,
                                99999,
                                c.fk_systempaymentmethod
                            ) AS \`systempaymentmethod\`
                        FROM dvw_transaction.vw_transactionpayment a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1
                        JOIN dvw_master.vw_paymentmethod c ON a.fk_paymentmethod = c.i_code
                        LEFT JOIN dvw_master.vw_customer d ON b.fk_customer = d.i_code
                        WHERE
                            b.fk_business = ${vw_transaction.fk_business}
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                            AND IFNULL(d.v_name,'') LIKE '${vw_customer.v_name}'
                            AND b.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND b.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND b.b_ispaid = 1
                            AND b.b_isactive = 1
                            AND b.b_isvoid = 0
                            AND c.i_code LIKE '${vw_paymentmethod.i_code}'
                    ) AS temp
                    GROUP BY \`paymentmethod\`, \`systempaymentmethod\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/getReportRevenuye', resolve)
    })
}

export function getReportConsolidationRevenue({res, connection}: typeGlobal.functions, {vw_transaction, vw_customer, vw_paymentmethod, vw_business}: {vw_transaction: {dt_paid: {date_start: string, date_end: string}, v_paidby: string, v_createdby: string}, vw_customer: {v_name: string}, vw_paymentmethod: {i_code: string}, vw_business: {fk_businessowner: number}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`paymentmethod\`,
                        SUM(\`value\`) - SUM(\`changes\`) AS \`value\`,
                        SUM(\`mdr\`) AS \`mdr\`,
                        \`systempaymentmethod\`
                    FROM
                    (
                        SELECT
                            c.v_name AS \`paymentmethod\`,
                            a.i_paidmoney * a.i_mdr / 100 AS \`mdr\`,
                            a.i_paidmoney  AS \`value\`,
                            (
                                SELECT 
                                    CASE 
                                        WHEN e.i_code = a.i_code THEN b.i_changes
                                        ELSE 0
                                    END
                                FROM dvw_transaction.vw_transactionpayment e
                                JOIN dvw_master.vw_paymentmethod f ON e.fk_paymentmethod = f.i_code
                                WHERE e.fk_transaction = b.i_code
                                ORDER BY f.fk_systempaymentmethod ASC
                                LIMIT 1
                            ) AS \`changes\`,
                            IF(
                                (
                                    SELECT COUNT(1)
                                    FROM dvw_transaction.vw_transactionpayment z
                                    JOIN dvw_master.vw_paymentmethod y ON y.i_code = z.fk_paymentmethod
                                    WHERE z.fk_transaction = b.i_code
                                        AND y.fk_systempaymentmethod = 4
                                ) > 0,
                                99999,
                                c.fk_systempaymentmethod
                            ) AS \`systempaymentmethod\`
                        FROM dvw_transaction.vw_transactionpayment a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1
                        JOIN dvw_master.vw_paymentmethod c ON a.fk_paymentmethod = c.i_code
                        LEFT JOIN dvw_master.vw_customer d ON b.fk_customer = d.i_code
                        JOIN dvw_account.vw_business e ON b.fk_business = e.i_code
                        WHERE
                            e.fk_businessowner = ${vw_business.fk_businessowner}
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                            AND IFNULL(d.v_name,'') LIKE '${vw_customer.v_name}'
                            AND b.v_paidby LIKE '${vw_transaction.v_paidby}'
                            AND b.v_createdby LIKE '${vw_transaction.v_createdby}'
                            AND b.b_ispaid = 1
                            AND b.b_isactive = 1
                            AND b.b_isvoid = 0
                            AND c.i_code LIKE '${vw_paymentmethod.i_code}'
                    ) AS temp
                    GROUP BY \`paymentmethod\`, \`systempaymentmethod\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/getReportConsolidationRevenue', resolve)
    })
}

export function getReportSpecialRevenue({res, connection}: typeGlobal.functions, {vw_business_user, vw_transaction}: {vw_business_user: {fk_user: number}, vw_transaction: {dt_paid: {date_start: string, date_end: string}}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`paymentmethod\`,
                        SUM(\`value\`) - SUM(\`changes\`) AS \`value\`,
                        SUM(\`mdr\`) AS \`mdr\`,
                        \`systempaymentmethod\`
                    FROM
                    (
                        SELECT
                            c.v_name AS \`paymentmethod\`,
                            a.i_paidmoney * a.i_mdr / 100 AS \`mdr\`,
                            a.i_paidmoney  AS \`value\`,
                            (
                                SELECT 
                                    CASE 
                                        WHEN e.i_code = a.i_code THEN b.i_changes
                                        ELSE 0
                                    END
                                FROM dvw_transaction.vw_transactionpayment e
                                WHERE e.fk_transaction = b.i_code
                                ORDER BY e.i_code DESC
                                LIMIT 1
                            ) AS \`changes\`,
                            IF(
                                (
                                    SELECT COUNT(1)
                                    FROM dvw_transaction.vw_transactionpayment z
                                    JOIN dvw_master.vw_paymentmethod y ON y.i_code = z.fk_paymentmethod
                                    WHERE z.fk_transaction = b.i_code
                                        AND y.fk_systempaymentmethod = 4
                                ) > 0,
                                99999,
                                c.fk_systempaymentmethod
                            ) AS \`systempaymentmethod\`
                        FROM dvw_transaction.vw_transactionpayment a
                        JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code AND b.b_ispaid = 1 AND b.b_isactive = 1
                        JOIN dvw_master.vw_paymentmethod c ON a.fk_paymentmethod = c.i_code
                        LEFT JOIN dvw_master.vw_customer d ON b.fk_customer = d.i_code
                        JOIN dvw_account.vw_business_user e ON b.fk_business = e.fk_business
                        WHERE
                            e.fk_user = ${vw_business_user.fk_user}
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') >= '${vw_transaction.dt_paid.date_start}'
                            AND DATE_FORMAT(b.dt_paid, '%Y-%m-%d') <= '${vw_transaction.dt_paid.date_end}'
                            AND b.b_ispaid = 1
                            AND b.b_isactive = 1
                            AND b.b_isvoid = 0
                    ) AS temp
                    GROUP BY \`paymentmethod\`, \`systempaymentmethod\`;`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/getReportSpecialRevenue', resolve)
    })
}

export function getName({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        b.v_name AS \`name\`
                    FROM 
                        dvw_transaction.vw_transactionpayment a
                        JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                    WHERE 
                        a.fk_transaction = ${fk_transaction}`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/getName', resolve)
    })
}

type getReportSalesProductDetailReceipt= {
    name: string
}
export function getReportSalesProductDetailReceipt({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getReportSalesProductDetailReceipt>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        b.v_name AS \`name\`
                    FROM 
                        dvw_transaction.vw_transactionpayment a
                    JOIN 
                        dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                    WHERE 
                        a.fk_transaction = ${fk_transaction}`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionpayment/getReportSalesProductDetailReceipt', resolve)
    })
}

type getPaymentReportSalesProductDetailReceipt = {
    paymentmethodcode: number,
    paymentmethodname: string,
    paidmoney: number
}
export function getPaymentReportSalesProductDetailReceipt({res, connection}: typeGlobal.functions, {fk_transaction}: {fk_transaction: number}): Promise<Array<getPaymentReportSalesProductDetailReceipt>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_paymentmethod AS paymentmethodcode, 
                        b.v_name AS paymentmethodname,
                        a.i_paidmoney AS paidmoney
                    FROM dvw_transaction.vw_transactionpayment a
                    JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                    WHERE a.fk_transaction = ${fk_transaction};`
        functionGlobal.query(query, res, connection, 'function/transaction/transactionPayment', resolve)
    })
}