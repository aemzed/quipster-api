import * as typeGlobal from "../../type/global"

import * as functionGlobal from "../../function/global_function"

export async function getReportStockOpname({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_hash AS \`hash\`,
                        a.dt_created AS \`date\`,
                        IFNULL(b.v_name, '') AS \`user\`,
                        COUNT(*) as qty
                    FROM dvw_operational.vw_stockopname a
                    LEFT JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    LEFT JOIN dvw_operational.vw_stockopname_detail c ON a.v_hash = c.fk_stockopname
                    WHERE a.fk_business = ${fk_business}
                        AND a.dt_created >= '${dt_created.date_start}'
                        AND a.dt_created <= DATE_ADD('${dt_created.date_end}', INTERVAL 1 DAY)
                    GROUP BY c.fk_stockopname
                    ORDER BY a.dt_created ASC`
        functionGlobal.query(query, res, connection, 'function/operational/stockopname/getReportStockOpname', resolve)
    })
}

export async function getReportStockOpnameDetail({res, connection}: typeGlobal.functions, {hash}: {hash: string}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_hash AS \`hash\`,
                        a.dt_created AS \`date\`,
                        IFNULL(b.v_name, '') AS \`user\`
                    FROM dvw_operational.vw_stockopname a
                    LEFT JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    WHERE a.v_hash = '${hash}'`
        functionGlobal.querySingle(query, res, connection, 'function/operational/stockopname/getReportStockOpnameDetail', resolve)
    })
}

export function insert({res, connection}: typeGlobal.functions, {v_hash, fk_business, fk_user, b_status,}: {v_hash: string, fk_business: number, fk_user: number, b_status?: number}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO
                        dvw_operational.vw_stockopname
                    SET
                        v_hash = '${v_hash}',
                        fk_business = ${fk_business},
                        ${b_status ? 
                        `b_status = ${b_status},`
                        :  ``}
                        fk_user = ${fk_user}
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stockopname/insert', resolve)
    })
}

type select = {
    id: string,
    date_created: string,
    status: number
}
export async function select({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start?: string, date_end?: string}}): Promise<Array<select>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_hash as id,
                        a.dt_created as date_created,
                        a.b_status as status,
                        b.v_name as user
                    FROM
                        dvw_operational.vw_stockopname a
                    LEFT JOIN
                        dvw_account.vw_user b ON a.fk_user = b.i_code AND b.fk_business = ${fk_business}
                    WHERE
                        a.fk_business = ${fk_business}
                        ${dt_created.date_start ?
                        `AND a.dt_created >= '${dt_created.date_start}'`
                        :
                        ``}
                        ${dt_created.date_end ?
                        `AND a.dt_created <= '${dt_created.date_end} 23:59:59'`
                        :
                        ``}
                    `
                    
        functionGlobal.query(query, res, connection, 'function/operational/stockopname/select', resolve)
    })
}

export async function updateStatus({res, connection}: typeGlobal.functions, {v_hash, b_status}: {v_hash: string, b_status: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE
                        dvw_operational.vw_stockopname
                    SET
                        b_status = ${b_status}
                    WHERE
                        v_hash = '${v_hash}'`
        functionGlobal.query(query, res, connection, 'function/operational/stockopname/updateStatus', resolve)
    })
}