import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type reportShiftExpense = {
    name: string,
    total: number,
    notes: string
}
export async function reportShiftExpense({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}, {vw_user}: {vw_user: {name: string}}): Promise<Array<reportShiftExpense>> {
    if(fk_business == 57 || fk_business == 5546) vw_user.name = "%"
    
    return new Promise((resolve, reject) => {
        let query = `   SELECT 
                            a.v_name AS 'name',
                            a.i_price AS 'total',
                            a.v_notes AS 'notes'
                        FROM dvw_operational.vw_expense a
                        JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                        WHERE
                            a.fk_business = ${fk_business}
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') >= '${dt_created.date_start}'
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') <= '${dt_created.date_end}'
                            AND b.v_name LIKE '${vw_user.name}'
                            AND a.i_type = 0
                            AND a.b_isconfirm = 1
                            AND a.b_isactive = 1
                        ORDER BY a.dt_created;`
        functionGlobal.query(query, res, connection, 'function/operational/expense/reportShiftExpense', resolve)
    })
}

export function updateCashRecap({res, connection}: typeGlobal.functions, {fk_cashrecap, fk_business, fk_user}: {fk_cashrecap: number, fk_business: number, fk_user: number}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE 
                        dvw_operational.vw_expense 
                    SET
                        fk_cashrecap = ${fk_cashrecap}
                    WHERE 
                        fk_business = ${fk_business}
                        AND fk_user = ${fk_user}
                        AND fk_cashrecap = 0
                    `
        functionGlobal.query(query, res, connection, 'function/operational/expense/updateCashRecap', resolve)
    })
}

export async function getExpenseReport({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {start_date: string, end_date: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.i_code AS 'code',
                        b.v_name AS 'type',
                        a.v_name AS 'name',
                        a.v_receipt AS 'receipt',
                        a.dt_created AS 'date',
                        a.i_type AS 'type_cash',
                        a.i_price AS 'total',
                        a.v_notes AS 'notes',
                        CASE
                            WHEN (a.v_image <> '') THEN CONCAT('https://www.woogigs.com/assets/img/business/', c.v_code, '/expense/', a.v_image)
                            ELSE ''
                        END AS 'image'
                    FROM dvw_operational.vw_expense a
                    JOIN dvw_master.vw_expense b ON a.fk_expense = b.i_code
                    JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.start_date}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.end_date}'
                        AND a.b_isactive = 1
                    ORDER BY a.dt_created ASC, a.dt_expense;`
        functionGlobal.query(query, res, connection, 'function/operational/expense/getExpenseReport', resolve)
    })
}

export async function getReportRevenue({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        b.v_name AS \`type\`,
                        SUM(a.i_price) AS \`total\`
                    FROM dvw_operational.vw_expense a
                    JOIN dvw_master.vw_expense b ON a.fk_expense = b.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.date_start}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                        AND a.b_isactive = 1
                    GROUP BY a.fk_expense;`
        functionGlobal.query(query, res, connection, 'function/operational/expense/getReportRevenue', resolve)
    })
}

export function getReportConsolidationRevenue({res, connection}: typeGlobal.functions, {dt_created, vw_business}: {dt_created: {date_start: string, date_end: string}, vw_business: {fk_businessowner: number}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        b.v_name AS \`type\`,
                        SUM(a.i_price) AS \`total\`
                    FROM dvw_operational.vw_expense a
                    JOIN dvw_master.vw_expense b ON a.fk_expense = b.i_code
                    JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                    WHERE
                        c.fk_businessowner = ${vw_business.fk_businessowner}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.date_start}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                        AND a.b_isactive = 1
                    GROUP BY a.fk_expense;`
        functionGlobal.query(query, res, connection, 'function/operational/expense/getReportConsolidationRevenue', resolve)
    })
}

export function getReportSpecialRevenue({res, connection}: typeGlobal.functions, {vw_business_user, dt_created}: {vw_business_user: {fk_user: number}, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        b.v_name AS \`type\`,
                        SUM(a.i_price) AS \`total\`
                    FROM dvw_operational.vw_expense a
                    JOIN dvw_master.vw_expense b ON a.fk_expense = b.i_code
                    JOIN dvw_account.vw_business_user c ON a.fk_business = c.fk_business
                    WHERE
                        c.fk_user = ${vw_business_user.fk_user}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.date_start}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                        AND a.b_isactive = 1
                    GROUP BY a.fk_expense;`
        functionGlobal.query(query, res, connection, 'function/operational/expense/getReportSpecialRevenue', resolve)
    })
}

export function getReportDashboard({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name?: string}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        IFNULL(SUM(a.i_price),0) AS \`totalexpense\`
                    FROM dvw_operational.vw_expense a
                    JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_expense, '%Y-%m-%d') >= DATE(NOW())
                        ${v_name != null ?
                        `AND b.v_name = ${v_name}`
                        : ``}
                        AND a.b_isconfirm = 1
                        AND a.b_isactive = 1
                    ORDER BY a.dt_expense;`
        functionGlobal.query(query, res, connection, 'function/operational/expense/getReportDashboard', resolve)
    })
}

type getTotalExpenseToday = {
    totalexpense: number
}
export function getTotalExpenseToday({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name: string}): Promise<Array<getTotalExpenseToday>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                            IFNULL(SUM(a.i_price),0) AS \`totalexpense\`
                        FROM dvw_operational.vw_expense a
                        JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                        WHERE
                            a.fk_business = ${fk_business}
                            AND DATE_FORMAT(a.dt_expense, '%Y-%m-%d') >= DATE(NOW())
                            AND b.v_name LIKE '${v_name}'
                            AND a.b_isconfirm = 1
                            AND a.b_isactive = 1
                        ORDER BY a.dt_expense;`
        functionGlobal.query(query, res, connection, 'function/master/expense/getTotalExpenseToday', resolve)
    })
}

type getReportShiftExpense = {
    name: string,
    value: string,
    notes: string,
    date: string
}
export function getReportShiftExpense({res, connection}: typeGlobal.functions, {fk_business, dt_created, vw_user}: {fk_business: number, dt_created: {date_start: string, date_end: string}, vw_user: {v_name: string}}): Promise<Array<getReportShiftExpense>> {
    return new Promise((resolve, rejeect) => {
        let query = `
                    SELECT 
                        a.v_name AS 'name',
                        a.i_price AS 'value',
                        a.v_notes AS 'notes',
                        a.dt_created AS 'date'
                    FROM dvw_operational.vw_expense a
                    JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') >= '${dt_created.date_start}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') <= '${dt_created.date_end}'
                        AND b.v_name LIKE '${vw_user.v_name}'
                        AND a.i_type = 0
                        AND a.b_isconfirm = 1
                        AND a.b_isactive = 1
                    ORDER BY a.dt_created;
                    `
        functionGlobal.query(query, res, connection, 'function/operational/expense/getReportShiftExpense', resolve)
    })
}

export async function updateCashRecapOld({res, connection}: typeGlobal.functions, {fk_cashrecap, fk_business, fk_user, dt_expense}: {fk_cashrecap: number, fk_business: number, fk_user: number, dt_expense: {startdate: string, enddate: string}}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_expense SET
                        fk_cashrecap = ${fk_cashrecap}
                    WHERE fk_business = ${fk_business}
                        AND fk_user = ${fk_user}
                        AND fk_cashrecap = 0
                        AND dt_expense >= '${dt_expense.startdate}'
                        AND dt_expense <= '${dt_expense.enddate}'`
        functionGlobal.query(query, res, connection, 'function/operational/expense/updateCashRecap', resolve)
    })
}