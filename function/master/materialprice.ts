import * as typeGlobal from '../../type/global'
import * as functionGlobal from '../global_function'

export function getReportPriceMaterial({res, connection}: typeGlobal.functions, {fk_business, dt_created, vw_material}: {fk_business: number, dt_created: {date_start: string, date_end: string}, vw_material: {i_code: number | '%'}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        b.v_name AS \`material_name\`,
                        a.i_price AS \`price\`,
                        a.v_notes AS \`notes\`,
                        a.dt_created AS \`date\`
                    FROM dvw_master.vw_materialprice a
                    JOIN dvw_master.vw_material b ON a.fk_material = b.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND date(a.dt_created) >= '${dt_created.date_start}'
                        AND date(a.dt_created) <= '${dt_created.date_end}'
                        AND b.i_code LIKE '${vw_material.i_code}'
                    ORDER BY a.dt_created`
        functionGlobal.query(query, res, connection, 'function/master/materialprice/getReportPriceMaterial', resolve)
    })
}