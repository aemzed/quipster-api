import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

type reportShiftCashIn = {
    date: string,
    value: string,
    notes: string
}
export async function reportShiftCashin({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}, {vw_user}: {vw_user: {name: string}}): Promise<Array<reportShiftCashIn>> {
    if(fk_business == 57 || fk_business == 5546) vw_user.name = "%"
    
    return new Promise((resolve, reject) => {
         let query = `SELECT 
                        a.dt_created AS "date",
                        a.i_value AS "value",
                        TRIM(a.v_notes) AS "notes"
                    FROM dvw_operational.vw_cash a
                    JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') >= '${dt_created.date_start}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') <= '${dt_created.date_end}'
                        AND b.v_name LIKE '${vw_user.name}'
                        AND a.i_type = 1
                        AND a.b_isactive = 1
                    ORDER BY a.dt_created`
    functionGlobal.query(query,res, connection, 'function/operational/cash/reportShiftCashin', resolve)
    })
}

export async function getReportShift({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: string}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`user\`,
                        CASE
                            WHEN a.fk_business = 5546 THEN CONCAT(DATE(\`startdate\`), ' 06:00:00')
                            ELSE MIN(a.dt_created) 
                        END AS \`date_start\`,
                        CASE
                            WHEN temp.recap <> 0 THEN MAX(a.dt_created)
                            ELSE 
                                CASE
                                    WHEN (
                                        DATE(temp.startdate) = DATE(NOW()) 
                                        OR (
                                            DATE(temp.startdate) + INTERVAL 1 day = DATE(NOW()) AND 
                                            TIME(NOW()) < SUBSTRING_INDEX(b.v_openinghours,'-',-1)
                                        )
                                    ) THEN ''
                                    WHEN TIME(SUBSTRING_INDEX(b.v_openinghours,'-',-1)) > TIME(SUBSTRING_INDEX(b.v_openinghours,'-',1)) THEN CONCAT(DATE(temp.startdate),' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1), ':00')
                                    ELSE CONCAT(DATE(temp.startdate) + INTERVAL 1 day,' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1), ':00')
                                END
                        END AS \`date_end\`,
                        CASE
                            WHEN temp.recap <> 0 THEN (SELECT c.i_value FROM dvw_operational.vw_cash c WHERE c.i_code = MAX(a.i_code))
                            ELSE 0
                        END AS \`cash_final\`,
                        CASE
                            WHEN temp.recap <> 0 THEN 'tertutup'
                            ELSE 'terbuka'
                        END AS \`status\`,
                        CASE
                            WHEN temp.recap <> 0 THEN (SELECT c.v_notes FROM dvw_operational.vw_cash c WHERE c.i_code = MAX(a.i_code))
                            ELSE ''
                        END AS \`notes\`
                    FROM
                    (
                        SELECT
                            b.fk_business AS \`business\`,
                            a.fk_user AS \`userid\`,
                            b.v_name AS \`user\`,
                            a.fk_cashrecap AS \`recap\`,
                            MIN(a.dt_created) AS \`startdate\`
                        FROM dvw_operational.vw_cash a
                        JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        WHERE a.fk_business = ${fk_business}
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created}'
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created}'
                            AND a.fk_user LIKE '%'
                            AND a.b_isactive = 1
                        GROUP BY a.fk_user, a.fk_cashrecap
                        ORDER BY a.dt_created
                    ) AS temp
                    LEFT JOIN dvw_operational.vw_cash a ON a.fk_cashrecap = temp.recap AND a.fk_business = temp.business AND a.dt_created >= temp.startdate AND a.fk_user = temp.userid
                    JOIN dvw_account.vw_business b ON temp.business = b.i_code
                    GROUP BY a.fk_user, a.fk_cashrecap;`
        functionGlobal.query(query, res, connection, 'function/operational/cash/getReportShift', resolve)
    })
}

type getReportShiftCashIn = {
    date: string,
    value: string,
    notes: string
}
export function getReportShiftCashIn({res, connection}: typeGlobal.functions, {fk_business, dt_created, vw_user}: {fk_business: number, dt_created: {date_start: string, date_end: string}, vw_user: {v_name: string}}): Promise<Array<getReportShiftCashIn>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT 
                        a.dt_created AS \`date\`,
                        a.i_value AS \`value\`,
                        TRIM(a.v_notes) AS \`notes\`
                    FROM dvw_operational.vw_cash a
                    JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    WHERE
                        a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') >= '${dt_created.date_start}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d %H:%i:%s') <= '${dt_created.date_end}'
                        AND b.v_name LIKE '${vw_user.v_name}'
                        AND a.i_type = 1
                        AND a.b_isactive = 1
                    ORDER BY a.dt_created;
                    `
        functionGlobal.query(query, res, connection, 'function/operational/cash/getReportShiftCashIn', resolve)
    })
}

type getRecentCashIn = {
    code: number
}
export function getRecentCashIn({res, connection}: typeGlobal.functions, {fk_business, fk_user, i_value, i_type, dt_created}: {fk_business: number, fk_user: number, i_value: number, i_type: number, dt_created: string}): Promise<Array<getRecentCashIn>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        a.i_code as code
                    FROM dvw_operational.vw_cash a
                    WHERE a.fk_business = ${fk_business}
                        AND a.fk_user = ${fk_user}
                        AND a.i_value = ${i_value}
                        AND a.i_type = ${i_type}
                        AND a.dt_created <= date_sub('${dt_created}', INTERVAL -5 minute)
                        AND a.dt_created >= date_sub('${dt_created}', INTERVAL 5 minute)
                    `
        functionGlobal.query(query, res, connection, 'function/operational/cash/getRecentCashIn', resolve)
    })
}

type insert = ResultSetHeader
export function insert({res, connection}: typeGlobal.functions, {fk_business, fk_user, i_type, i_value, v_notes, dt_created}: {fk_business: number, fk_user: number, i_type: number, i_value: number, v_notes: string, dt_created: string}): Promise<insert> {
    return new Promise((resolve, reject) => {
        let query = `
                    INSERT INTO 
                        dvw_operational.vw_cash
                    SET
                        fk_business = ${fk_business},
                        fk_user = ${fk_user},
                        i_type = ${i_type},
                        i_value = ${i_value},
                        v_notes = '${v_notes}',
                        dt_created = '${dt_created}'
                    `
        functionGlobal.query(query, res, connection, 'function/operational/cash/insert', resolve)
    })
}

export function updateCashRecap({res, connection}: typeGlobal.functions, {fk_cashrecap, fk_business, fk_user}: {fk_cashrecap: number, fk_business: number, fk_user: number}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE
                        dvw_operational.vw_cash
                    SET
                        fk_cashrecap = ${fk_cashrecap}
                    WHERE
                        fk_business = ${fk_business}
                        AND fk_user = ${fk_user}
                        AND fk_cashrecap = 0
                        AND dt_created >= '2023-06-01'
                    `
        functionGlobal.query(query, res, connection, 'function/operational/cash/updateCashRecap', resolve)
    })
}

export async function updateCashRecapOld({res, connection}: typeGlobal.functions, { fk_cashrecap, fk_business, fk_user, dt_created }: {fk_cashrecap: number, fk_business: number, fk_user: number, dt_created: {startdate: string, enddate: string}}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_cash SET
                        fk_cashrecap = ${fk_cashrecap}
                    WHERE fk_business = ${fk_business}
                        AND fk_user = ${fk_user}
                        AND fk_cashrecap = 0
                        AND dt_created >= '${dt_created.startdate}'
                        AND dt_created <= '${dt_created.enddate}'`
        functionGlobal.query(query, res, connection, 'function/operational/cash/updateCashRecap', resolve)
    })
}