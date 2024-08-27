import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type selectItemPricePoint = {
    item: number,
    hpp: number,
    price_1: number,
    price_2: number,
    price_3: number,
    price_4: number,
    price_5: number,
    point: number
}
export async function selectItemPricePoint({res, connection}: typeGlobal.functions, {fk_material}: {fk_material: number}): Promise<Array<selectItemPricePoint>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`temp\`.\`item\` AS \`item\`, 
                        \`temp\`.\`price_new\` AS \`hpp\`, 
                        \`temp\`.\`price_1\` AS \`price_1\`, 
                        \`temp\`.\`price_2\` AS \`price_2\`, 
                        \`temp\`.\`price_3\` AS \`price_3\`, 
                        \`temp\`.\`price_4\` AS \`price_4\`, 
                        \`temp\`.\`price_5\` AS \`price_5\`, 
                        \`temp\`.\`point\` AS \`point\`
                    FROM (
                        SELECT
                            a.fk_item AS \`item\`, 
                            SUM(a.i_qty * b.i_price) AS \`price_new\`,
                            d.i_pricenet AS \`price_net\`,
                            d.i_price AS \`price_1\`,
                            d.i_price2 AS \`price_2\`,
                            d.i_price3 AS \`price_3\`,
                            d.i_price4 AS \`price_4\`,
                            d.i_price5 AS \`price_5\`,
                            d.i_point AS \`point\`
                        FROM (
                            SELECT z.fk_item AS \`item\`
                            FROM dvw_operational.vw_formula z
                            WHERE z.fk_material = ${fk_material}
                            GROUP BY z.fk_item
                        ) \`temp\`
                        JOIN dvw_operational.vw_formula a ON \`temp\`.item = a.fk_item
                        JOIN dvw_master.vw_material b ON a.fk_material = b.i_code
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        JOIN dvw_master.vw_item d ON a.fk_item = d.i_code 
                        GROUP BY \`temp\`.item
                    ) \`temp\`
                    WHERE \`temp\`.\`price_new\` != \`temp\`.\`price_net\``
        
        functionGlobal.query(query, res, connection, 'function/operational/formula/selectItemPricePoint', resolve)
    })
}

export function getQTYNMaterialsNUnit({res, connection}: typeGlobal.functions, {fk_item}: {fk_item: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        b.i_code AS \`material_code\`,
                        b.v_name AS \`material_name\`,
                        a.i_qty AS \`qty\`,
                        c.v_name AS \`unit_name\`
                    FROM dvw_operational.vw_formula a
                    JOIN dvw_master.vw_material b ON a.fk_material = b.i_code AND b.b_isactive = 1
                    JOIN dvw_master.vw_unit c ON b.fk_unit = c.i_code
                    WHERE a.fk_item = ${fk_item}`
        functionGlobal.query(query, res, connection, 'function/operational/formula/getQTYNMaterialNUnit', resolve)
    })
}

type getMaterialNPriceNQty = {
    material: number,
    price: number,
    qty: number
}
export function getMaterialNPriceNQty({res, connection}: typeGlobal.functions, {fk_item, fk_business}: {fk_item: number, fk_business: number}): Promise<Array<getMaterialNPriceNQty>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_material AS \`material\`,
                        b.i_price AS \`price\`,
                        a.i_qty AS \`qty\`
                    FROM dvw_operational.vw_formula a
                    JOIN dvw_master.vw_material b ON a.fk_material = b.i_code
                    WHERE a.fk_item = ${fk_item}
                        AND a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/operational/formula/getMaterialNPriceNQty', resolve)
    })
}