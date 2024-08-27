import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type get = {
    code: number,
    name: string,
    unit: number,
    unit_name: string,
    price: number,
    qty: number,
    qtyalert: number,
    notes: string
}
export async function get({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<Array<get>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS "code",
                        a.v_name AS "name",
                        a.fk_unit AS "unit",
                        b.v_name AS "unit_name",
                        ROUND(a.i_price) AS "price",
                        a.i_qty AS "qty",
                        a.i_qtyalert AS "qty_alert",
                        a.v_notes AS "notes"
                    FROM dvw_master.vw_material a
                    JOIN dvw_master.vw_unit b ON a.fk_unit = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                    ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/master/material/get', resolve)
    })
}

type getPricenetNUnit = {
    price_net: number,
    unit: number
}
export function getPricenetNUnit({res, connection}: typeGlobal.functions, {i_code, fk_business}: {i_code: number, fk_business: number}): Promise<getPricenetNUnit> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_price AS \`price_net\`,
                        a.fk_unit AS \`unit\`
                    FROM dvw_master.vw_material a
                    WHERE a.b_isactive=1
                        AND a.i_code = ${i_code}
                        AND a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/master/material/getPricenetNUnit', resolve)
    })
}

type getQty = {
    qty: number
}
export function getQty({res, connection}: typeGlobal.functions, {fk_business, i_code}: {fk_business: number, i_code: number}): Promise<getQty> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        i_qty as qty
                    FROM
                        dvw_master.vw_material
                    WHERE
                        i_code = ${i_code}
                        AND fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/master/material/getQty', resolve)
    })
}