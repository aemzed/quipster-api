import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type selectPackageHPPPrices = {
    package: number,
    hpp: number,
    price_1: number,
    price_2: number,
    price_3: number,
    price_4: number,
    price_5: number
}
export async function selectPackageHPPPrices({res, connection}: typeGlobal.functions, {fk_item}: {fk_item: number}): Promise<Array<selectPackageHPPPrices>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        \`temp\`.\`package\` AS \`package\`, 
                        \`temp\`.\`price_new\` AS \`hpp\`, 
                        \`temp\`.\`price_1\` AS \`price_1\`, 
                        \`temp\`.\`price_2\` AS \`price_2\`, 
                        \`temp\`.\`price_3\` AS \`price_3\`, 
                        \`temp\`.\`price_4\` AS \`price_4\`, 
                        \`temp\`.\`price_5\` AS \`price_5\`
                    FROM (
                        SELECT
                            a.fk_package AS \`package\`, 
                            SUM(a.i_qty * b.i_pricenet) AS \`price_new\`,
                            c.i_pricenet AS \`price_net\`,
                            c.i_price AS \`price_1\`,
                            c.i_price2 AS \`price_2\`,
                            c.i_price3 AS \`price_3\`,
                            c.i_price4 AS \`price_4\`,
                            c.i_price5 AS \`price_5\`
                        FROM (
                            SELECT z.fk_package AS \`package\`
                            FROM dvw_master.vw_packagedetail z
                            WHERE z.fk_item = ${fk_item}
                                AND z.b_isactive = 1
                            GROUP BY z.fk_package
                        ) \`temp\`
                        JOIN dvw_master.vw_packagedetail a ON \`temp\`.\`package\` = a.fk_package
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code 
                        JOIN dvw_master.vw_package c ON a.fk_package = c.i_code 
                        WHERE a.b_isactive = 1
                        GROUP BY \`temp\`.\`package\`
                    ) \`temp\`
                    WHERE \`temp\`.\`price_new\` <> \`temp\`.\`price_net\``
        
        functionGlobal.query(query, res, connection, 'function/master/packagedetail/selectPackageHPPPrices', resolve)
    })
}