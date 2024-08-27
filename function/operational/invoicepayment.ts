import * as functionGlobal from "../global_function"
import * as typeGlobal from '../../type/global'

type reportShiftInvoice = {
    date: string,
    value: number
}
export async function reportShiftInvoice({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {startdate: string, enddate: string}}, {user}: {user:{name: string}}): Promise<Array<reportShiftInvoice>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                    a.dt_paid AS "date",
                    a.i_totalpaid AS "value"
                FROM dvw_operational.vw_invoicepayment a
                JOIN dvw_account.vw_user b ON a.fk_userpaid = b.i_code
                WHERE
                    a.fk_business = ${fk_business}
                    AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i:%s') >= '${dt_paid.startdate}'
                    AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i:%s') <= '${dt_paid.enddate}'
                    AND b.v_name LIKE '${user.name}'
                ORDER BY a.dt_paid`
        functionGlobal.query(query, res, connection, 'function/operational/invoicepayment/reportShiftInvoice', resolve)
    })
}

type getInvoicePaidReport = {
    date: string,
    nominal: number,
    total_invoice: number,
    customer_name: string,
    invoice_code: string,
    receipt: string,
    date_invoice: string
}
export async function getInvoicePaidreport({res, connection}: typeGlobal.functions, {fk_business, dt_paid}: {fk_business: number, dt_paid: {start_date: string, end_date: string}}): Promise<Array<getInvoicePaidReport>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.dt_paid AS \`date\`,
                        a.i_totalpaid AS \`nominal\`,
                        b.i_totalinvoice AS \`total_invoice\`,
                        c.v_name AS \`customer_name\`,
                        b.v_code AS \`invoice_code\`,
                        d.s_offlinecode AS \`receipt\`,
                        b.dt_invoice AS \`date_invoice\`
                    FROM dvw_operational.vw_invoicepayment a
                    JOIN dvw_operational.vw_invoice b ON a.fk_invoice = b.i_code
                    JOIN dvw_master.vw_customer c ON a.fk_customer = c.i_code
                    JOIN dvw_transaction.vw_transaction d ON b.fk_transaction = d.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${dt_paid.start_date}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${dt_paid.end_date}'`
        functionGlobal.query(query, res, connection, 'function/operational/invoicepayment/getInvoicePaidrReport', resolve)
    })
}

export function getReportInvoiceHistory({res, connection}: typeGlobal.functions, {fk_business, vw_invoice}: {fk_business: number, vw_invoice: {v_code: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_totalpaid AS total,
                        a.dt_paid AS date
                    FROM dvw_operational.vw_invoicepayment a
                    JOIN dvw_operational.vw_invoice b ON a.fk_invoice = b.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND b.v_code = '${vw_invoice.v_code}';`
        functionGlobal.query(query, res, connection, 'function/operational/invoicepayment/getReportInvoiceHistory', resolve)
    })
}

export function getReportShiftDetail({res, connection}: typeGlobal.functions, {fk_business, dt_paid, vw_user}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, vw_user: {v_name: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.dt_paid AS \`date\`,
                        a.i_totalpaid AS \`value\`
                    FROM dvw_operational.vw_invoicepayment a
                    JOIN dvw_account.vw_user b ON a.fk_userpaid = b.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i:%s') >= '${dt_paid.date_start}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i:%s') <= '${dt_paid.date_end}'
                        AND b.v_name LIKE '${fk_business === 57 || fk_business === 5546 ? '%' : vw_user.v_name}'
                    ORDER BY a.dt_paid;`
        functionGlobal.query(query, res, connection, 'function/operational/invoicepayment/getReportShiftDetail', resolve)
    })
}

type getShiftReportInvoice = {
    date: string,
    value: string
}
export function getReportShiftInvoicePaid({res, connection}: typeGlobal.functions, {fk_business, dt_paid, vw_user}:{fk_business: number, dt_paid: {date_start: string, date_end: string}, vw_user: {v_name: string}}): Promise<Array<getShiftReportInvoice>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT 
                        a.dt_paid AS \`date\`,
                        a.i_totalpaid AS \`value\`
                    FROM dvw_operational.vw_invoicepayment a
                    JOIN dvw_account.vw_user b ON a.fk_userpaid = b.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i:%s') >= '${dt_paid.date_start}'
                        AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i:%s') <= '${dt_paid.date_end}'
                        AND b.v_name LIKE '${vw_user.v_name}'
                    ORDER BY a.dt_paid;
                    `
        functionGlobal.query(query, res, connection, 'function/operational/invoicepayment', resolve)
    })
}