import * as typeGlobal from "../../type/global"

import * as functionGlobal from "../global_function"

export async function getReportStatementQris({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.fk_withdraw AS \`withdraw_code\`,
                        a.dt_created AS \`date\`,
                        a.v_notes AS \`notes\`,
                        a.v_receipt AS \`receipt\`,
                        a.v_image AS \`image\`,
                        a.i_amount AS \`amount\`,
                        a.i_balance AS \`balance\`,
                        a.b_paid AS \`status\`
                    FROM dvw_operational.vw_deposit_business_statement a
                    WHERE fk_business = ${fk_business}
                        AND DATE(a.dt_created) >= '${dt_created.date_start}'
                        AND DATE(a.dt_created) <= '${dt_created.date_end}'
                    ORDER BY a.dt_created ASC, a.i_order ASC;`
        functionGlobal.query(query, res, connection, 'function/operational/deposit_business_statement/getReportStatementQris', resolve)
    })
}