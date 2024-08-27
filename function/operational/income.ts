import * as typeGlobal from "../../type/global"

import * as functionGlobal from "../global_function"

export async function getReportRevenue({res, connection}: typeGlobal.functions, {fk_business, dt_income}: {fk_business: number, dt_income: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_name AS \`name\`,
                        a.i_value AS \`value\`
                    FROM dvw_operational.vw_income a
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_income, '%Y-%m-%d') >= '${dt_income.date_start}'
                        AND DATE_FORMAT(a.dt_income, '%Y-%m-%d') <= '${dt_income.date_end}'
                        AND a.b_isactive = 1;`
        functionGlobal.query(query, res, connection, 'function/operational/income/getReportRevenue', resolve)
    })
}

export function getReportConsolidationRevenue({res, connection}: typeGlobal.functions, {vw_business, dt_income}: {vw_business: {fk_businessowner: number}, dt_income: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_name AS \`name\`,
                        a.i_value AS \`value\`
                    FROM dvw_operational.vw_income a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE
                        b.fk_businessowner = ${vw_business.fk_businessowner}
                        AND DATE_FORMAT(a.dt_income, '%Y-%m-%d') >= '${dt_income.date_start}'
                        AND DATE_FORMAT(a.dt_income, '%Y-%m-%d') <= '${dt_income.date_end}'
                        AND a.b_isactive = 1;`
        functionGlobal.query(query, res, connection, 'function/operational/income/getReportConsolidationRevenue', resolve)
    })
}

export function getReportSpecialRevenue({res, connection}: typeGlobal.functions, {dt_income, vw_business_user}: {dt_income: {date_start: string, date_end: string}, vw_business_user: {fk_user: number}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_name AS \`name\`,
                        a.i_value AS \`value\`
                    FROM dvw_operational.vw_income a
                    JOIN dvw_account.vw_business_user c ON a.fk_business = c.fk_business
                    WHERE
                        c.fk_user = ${vw_business_user.fk_user}
                        AND DATE_FORMAT(a.dt_income, '%Y-%m-%d') >= '${dt_income.date_start}'
                        AND DATE_FORMAT(a.dt_income, '%Y-%m-%d') <= '${dt_income.date_end}'
                        AND a.b_isactive = 1;`
        functionGlobal.query(query, res, connection, 'function/operational/income/getReportSpecialRevenue', resolve)
    })
}