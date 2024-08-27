import * as typeGlobal from '../../type/global'

import * as functionGlobal from "../global_function"

export async function getReportTransferStockDetail({res, connection}: typeGlobal.functions, {fk_businessorigin, dt_created}: {fk_businessorigin: number, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        DATE(a.dt_created) AS \`date\`,
                        b.v_code AS \`item_sku\`,
                        b.v_name AS \`item_name\`,
                        a.i_price AS \`price\`,
                        a.i_hpp AS \`hpp\`,
                        a.i_qtysent AS \`qty\`,
                        a.v_notes AS \`notes\`
                    FROM dvw_operational.vw_stocktransfer a
                    JOIN dvw_master.vw_item b ON a.fk_itemmaterialorigin = b.i_code
                    WHERE a.fk_businessorigin = ${fk_businessorigin}
                        AND a.b_type = 1
                        AND a.b_isconfirm = 1
                        AND DATE(a.dt_created) >= '${dt_created.date_start}'
                        AND DATE(a.dt_created) <= '${dt_created.date_end}'`
        functionGlobal.query(query, res, connection, 'function/operational/stocktransfer/getReportTransferStockDetail', resolve)
    })
}

export async function getReportTransferStockSummary({res, connection}: typeGlobal.functions, {fk_businessorigin, dt_created}: {fk_businessorigin: number, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        DATE(a.dt_created) AS \`date\`,
                        SUM(a.i_price * a.i_qtysent) AS \`price\`,
                        SUM(a.i_hpp * a.i_qtysent) AS \`hpp\`,
                        SUM(a.i_qtysent) AS \`qty\`
                    FROM dvw_operational.vw_stocktransfer a
                    WHERE a.fk_businessorigin = ${fk_businessorigin}
                        AND a.b_isconfirm = 1
                        AND DATE(a.dt_created) >= '${dt_created.date_start}'
                        AND DATE(a.dt_created) <= '${dt_created.date_end}'
                    GROUP BY DATE(a.dt_created)`
        functionGlobal.query(query, res, connection, 'function/operational/stocktransfer/getReportTransferStockSummary', resolve)
    })
}

export async function insert({res, connection}: typeGlobal.functions, {fk_businessorigin, fk_businessdestination, fk_itemmaterialorigin, fk_itemmaterialdestination, fk_unitorigin, fk_unitdestination, b_type, i_qtysent, fk_usersent, v_notes}: {fk_businessorigin: number, fk_businessdestination: number, fk_itemmaterialorigin: number, fk_itemmaterialdestination: number, fk_unitorigin: number, fk_unitdestination: number, b_type: number, i_qtysent: number, fk_usersent: number, v_notes: string}) {
    return new Promise((resolve, reject) => {
        let query = `
                    INSERT INTO
                        dvw_operational.vw_stocktransfer
                    SET
                        fk_businessorigin = ${fk_businessorigin},
                        fk_businessdestination = ${fk_businessdestination},
                        fk_itemmaterialorigin = ${fk_itemmaterialorigin},
                        fk_itemmaterialdestination = ${fk_itemmaterialdestination},
                        fk_unitorigin = ${fk_unitorigin},
                        fk_unitdestination = ${fk_unitdestination},
                        b_type = ${b_type},
                        i_qtysent = ${i_qtysent},
                        fk_usersent = ${fk_usersent},
                        v_notes =' ${v_notes}'
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stocktransfer/insert', resolve)
    })
}