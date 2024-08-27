import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

type getCodeAndFirstUnit = {
    code: number
    fkUnit: number
}
export async function getCodeAndFirstUnit ({res, connection, fk_business, code}: typeGlobal.functions & {fk_business: number, code: number}):Promise<getCodeAndFirstUnit> {
    return new Promise(async(resolve, reject) => {
        type queryResult = {
            code: number,
            unit: number
        }
        let query = `SELECT 
                        c.i_code AS "code",
                        (SELECT z.i_code FROM dvw_master.vw_unit z WHERE z.fk_business = ${fk_business} LIMIT 1) AS "unit"
                    FROM dvw_master.vw_item b
                    JOIN dvw_master.vw_item c ON b.v_name = c.v_name AND c.fk_business = ${fk_business}
                    WHERE b.i_code = ${code}
                    GROUP BY c.v_name`
        let result:queryResult = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/item/getCodeAndFirstUnit', resolve))
        resolve(<getCodeAndFirstUnit> {
            code: result.code,
            fkUnit: result.unit
        })
    })
}


type getStockByName = {
    itemName: string,
    stock: number
}
export async function getStockByName({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name: string}): Promise<Array<getStockByName>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        v_name as itemName,
                        i_qty as stock
                    FROM
                        dvw_master.vw_item
                    WHERE
                        fk_business = ${fk_business}
                        AND v_name LIKE '%${v_name}%'
                        AND b_isactive = 1
                    `
        functionGlobal.query(query, res, connection, 'function/master/item/getStock', resolve)
    })
}

type getCommision = {
    alias: string,
    name: string,
    commisionType: number,
    commisionValue: number
}
export async function getCommision({res, connection}: typeGlobal.functions, {code, fk_business} : {code: number, fk_business: number}): Promise<getCommision> {
    return new Promise(async (resolve, reject) => {
        type resultQuery = {
            alias: string,
            name: string,
            commision_type: number,
            commision_value: number
        }
        let query = `SELECT 
                        a.v_code AS "alias",
                        a.v_name AS "name",
                        b_commision AS "commision_type",
                        i_commision AS "commision_value"
                    FROM dvw_master.vw_item a
                    WHERE a.i_code = ${code}
                        AND a.fk_business = ${fk_business}`
        let result: resultQuery = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/item/getCommision', resolve))
        resolve(<getCommision>{
            alias: result.alias,
            commisionType: result.commision_type,
            commisionValue: result.commision_value,
            name: result.name
        })
    })
}

export async function updatePriceNet({res, connection}: typeGlobal.functions, {fk_user_modify, fk_business, pricenet, code}: {fk_user_modify: number, fk_business: number, pricenet: number, code: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_item SET
                        fk_user_modify = ${fk_user_modify},
                        i_pricenet = ${pricenet}
                    WHERE fk_business = ${fk_business}
                        AND i_code = ${code}`
        
        functionGlobal.query(query, res, connection, 'function/master/item/updatePriceNet', resolve)
    })
}

type getTypeCodeCustomcode = {
    type: number,
    code: number,
    code_custom: string,
    name: string,
    price: string
}
export async function itemMaterialGet({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<Array<getTypeCodeCustomcode>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM (
                    SELECT
                        1 AS 'type',
                        a.i_code AS 'code',
                        a.v_code AS 'code_custom',
                        CASE LENGTH(a.v_name)
                            WHEN 1 THEN CONCAT(a.v_name, ' ')
                            ELSE a.v_name
                        END AS 'name',
                        a.i_pricenet AS 'price'
                    FROM dvw_master.vw_item a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                    UNION ALL
                    SELECT
                        2 AS 'type',
                        a.i_code AS 'code',
                        '' AS 'code_custom',
                        CASE LENGTH(a.v_name)
                            WHEN 1 THEN CONCAT(a.v_name, ' ')
                            ELSE a.v_name
                        END AS 'name',
                        a.i_price AS 'price'
                    FROM dvw_master.vw_material a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                ) temp
                ORDER BY name`
        functionGlobal.query(query, res, connection, 'function/master/item/getTypeCodeCustomcode', resolve)
    })
}

type getSKUNameQtyHPPTotal = {
    sku: string,
    name: string,
    qty: number,
    hpp_total: number
}
export async function getSKUNameQtyHPPTotalOwner({res,connection}: typeGlobal.functions, {fk_businessowner}: {fk_businessowner: number}): Promise<Array<getSKUNameQtyHPPTotal>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_code AS \`sku\`,
                        a.v_name AS \`name\`,
                        SUM(a.i_qty) AS \`qty\`,
                        SUM(a.i_qty * a.i_pricenet) AS \`hpp_total\`
                    FROM dvw_master.vw_item a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.fk_businessowner = ${fk_businessowner}
                        AND a.b_isactive = 1
                        AND b.b_isactive = 1
                        AND a.b_hasstock = 1
                    GROUP BY a.v_code
                    ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/master/item/getSKUNameQtyHPPTotal', resolve)
    })
}

export async function getSKUNameQtyHPPTotalUser({res, connection}: typeGlobal.functions, {fk_user}: {fk_user: number}): Promise<Array<getSKUNameQtyHPPTotal>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_code AS \`sku\`,
                        a.v_name AS \`name\`,
                        SUM(a.i_qty) AS \`qty\`,
                        SUM(a.i_qty * a.i_pricenet) AS \`hpp_total\`
                    FROM dvw_master.vw_item a
                    JOIN dvw_account.vw_business_user b ON a.fk_business = b.fk_business
                    WHERE b.fk_user = ${fk_user}
                        AND a.b_isactive = 1
                        AND a.b_hasstock = 1
                    GROUP BY a.v_code
                    ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/master/item/getSKUNameQtyHPPTotalUser', resolve)
    })
}

export async function getReportStockOpnameIgnoreDetail({res, connection}: typeGlobal.functions, {fk_business, fk_stockopname}: {fk_business: number, fk_stockopname: string}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_code AS \`item_sku\`,
                        a.v_name AS \`item_name\`
                    FROM dvw_master.vw_item a
                    WHERE a.fk_business = ${fk_business}
                        AND a.b_isactive = 1
                        AND a.i_code NOT IN (
                            SELECT z.fk_item
                            FROM dvw_operational.vw_stockopname_detail z
                            WHERE z.fk_stockopname = '${fk_stockopname}'
                        )`
        functionGlobal.query(query, res, connection, 'function/master/item/getReportStockOpnameIgnoreDetail', resolve)
    })
}

type updateCommission = ResultSetHeader
export async function updateCommission({res, connection}: typeGlobal.functions, {fk_user_modify, i_code, b_commission, i_commission}: {fk_user_modify: number, i_code: number, b_commission: number, i_commission: number}): Promise<updateCommission> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_item a SET
                        a.fk_user_modify = ${fk_user_modify},
                        a.b_commision = ${b_commission},
                        a.i_commision = ${i_commission}
                    WHERE a.i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/master/item/updateCommission', resolve)
    })
}

export function updateDistributor({res, connection}: typeGlobal.functions, {fk_user_modify, b_distributor, fk_business, i_code}: {fk_user_modify: number, b_distributor: number, fk_business: number, i_code: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_item SET
                        fk_user_modify = ${fk_user_modify},
                        b_distributor = ${b_distributor}
                    WHERE fk_business = ${fk_business}
                        AND i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/master/item/updateDistributor', resolve)
    })
}

type getNameSKUOwner = {
    name: string,
    sku: string,
    owner: number
}
export function getNameSKUOwner({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}): Promise<getNameSKUOwner> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name AS \`name\`,
                        a.v_code AS \`sku\`,
                        b.fk_businessowner AS \`owner\`
                    FROM dvw_master.vw_item a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/item/getNameSKUOwner', resolve)
    })
}

type getCodeSKUNNameNBusiness = {
    code: number,
    sku: string,
    name: string,
    business_name: string,
    business: number
}
export async function getCodeNSKUNNameNBusiness({res, connection}: typeGlobal.functions, {i_code, fk_business, v_name, v_code, vw_business}: {i_code: number, fk_business: number, v_name: string, v_code: string, vw_business: {fk_businessowner: number}}):Promise<Array<getCodeSKUNNameNBusiness>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_code AS \`sku\`,
                        a.v_name AS \`name\`,
                        b.v_name AS \`business_name\`,
                        b.i_code AS \`business\`
                    FROM dvw_master.vw_item a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.fk_businessowner = ${vw_business.fk_businessowner}
                        AND a.i_code <> ${i_code}
                        AND a.fk_business <> ${fk_business}
                        AND (a.v_code = '${v_code}' OR a.v_name = '${v_name}')
                        AND a.b_isactive = 1
                        AND b.dt_expired > NOW()
                    ORDER BY b.i_code`
        functionGlobal.query(query, res, connection, 'function/master/item/getCondeNSkuNNameNBusiness', resolve)
    })
}

export function softDelete({res, connection}: typeGlobal.functions, {fk_user_modify, i_code}: {fk_user_modify: number, i_code: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_item SET
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/master/item/softDelete', resolve)
    })
}

export function updateImage({res, connection}: typeGlobal.functions, {fk_user_modify, i_code, v_image, v_image_link}: {fk_user_modify: number, i_code: number, v_image?: string, v_image_link: string}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE 
                        dvw_master.vw_item
                    SET 
                        fk_user_modify = ${fk_user_modify},
                        ${v_image ?
                        `v_image = '${v_image}',`
                        : ``}
                        v_image_link = '${v_image_link}'
                    WHERE i_code = ${i_code}`
        
        functionGlobal.query(query, res, connection, 'function/master/item/updateImage', resolve)
    })
}

type getTotalNLimit = {
    total: number,
    limit: number
}
export function getTotalNLimit({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getTotalNLimit> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        COUNT(1) AS \`total\`,
                        b.i_limitmaster AS \`limit\`
                    FROM dvw_master.vw_item a
                    INNER JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/master/item/getTotalNLimit', resolve)
    })
}

type getSKU = {
    sku: string
}
export function getSKU({res, connection}: typeGlobal.functions, {fk_business, v_code, v_name}: {fk_business: number, v_code: string, v_name: string}): Promise<getSKU> {
    return new Promise((resolve, reject) => {
        let query = `SELECT a.v_code AS \`sku\`
                    FROM dvw_master.vw_item a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND (
                            a.v_code = '${v_code}'
                            OR a.v_name = '${v_name}'
                        )
                    ORDER BY a.v_code`
        functionGlobal.querySingle(query, res, connection, 'function/master/item/getSKU', resolve)
    })
}

type getSKUFromCode = {
    sku: string
}
export function getSKUfromCode({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}): Promise<getSKUFromCode> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_code AS \`sku\`
                    FROM dvw_master.vw_item a
                    WHERE a.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/item/getSKUFromCode', resolve)
    })
}
export function insert({res, connection}: typeGlobal.functions, {fk_user_modify, fk_business, fk_business_owner, v_code, v_name, fk_category, b_hasformula, b_hasstock, fk_unit, v_unit_variance, i_qtyalert, v_notes, i_pricenet, b_distributor, b_showinplatform, b_recommendation}: {fk_user_modify: number, fk_business: number, fk_business_owner: number, v_code: string, v_name: string, fk_category: number, b_hasformula: number, b_hasstock: number, fk_unit: number, v_unit_variance: string, i_qtyalert: number, v_notes: string, i_pricenet: number, b_distributor: number, b_showinplatform: number, b_recommendation: number}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_item SET
                    fk_user_modify = ${fk_user_modify},
                    fk_business = ${fk_business},
                    fk_business_owner = ${fk_business_owner},
                    v_code = '${v_code}',
                    v_name = '${v_name}',
                    fk_category = ${fk_category},
                    b_hasformula = ${b_hasformula},
                    b_hasstock = ${b_hasstock},
                    fk_unit = ${fk_unit},
                    v_unit_variance = '${v_unit_variance}',
                    i_qtyalert = ${i_qtyalert},
                    v_notes = '${v_notes}',
                    i_pricenet = ${i_pricenet},
                    b_distributor = ${b_distributor},
                    b_showinplatform = ${b_showinplatform},
                    b_recommendation = ${b_recommendation}`
        functionGlobal.query(query, res, connection, 'function/master/item/insert', resolve)
    })
}

type getPricenetNUnit = {
    price_net: number,
    unit: number
}
export function getPricenetNUnit({res, connection}: typeGlobal.functions, {i_code, fk_business}: {i_code: number, fk_business: number}): Promise<getPricenetNUnit> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_pricenet AS \`price_net\`,
                        a.fk_unit AS \`unit\`
                    FROM dvw_master.vw_item a
                    WHERE a.b_isactive=1
                        AND a.i_code= ${i_code}
                        AND a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/master/item/getPricenetNUnit', resolve)
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
                        dvw_master.vw_item
                    WHERE
                        i_code = ${i_code}
                        AND fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/master/item/getQty', resolve)
    })
}

type getName = {
    name: string
}
export async function getNameFromCustomCode({res, connection}: typeGlobal.functions, {fk_business, v_code, i_code}: {fk_business: number, v_code: string, i_code: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name as name
                    FROM
                        dvw_master.vw_item a
                    WHERE
                        a.fk_business = ${fk_business}
                        AND a.v_code = '${v_code}'
                        AND a.i_code != '${i_code}'
                    `
        functionGlobal.querySingle(query, res, connection, 'function/master/item/getNameFromCustomCode', resolve)
    })
}

export async function update({res, connection}: typeGlobal.functions, {i_code, v_code, v_name, fk_category, b_hasformula, b_hasstock, fk_unit, v_unit_variance, i_qtyalert, v_notes, b_showinplatform, b_recommendation}: {i_code: number, v_code: string, v_name: string, fk_category: number, b_hasformula: number, b_hasstock: number, fk_unit: number, v_unit_variance: string, i_qtyalert: number, v_notes: string, b_showinplatform: number, b_recommendation: number}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE
                        dvw_master.vw_item
                    SET
                        v_code = '${v_code}',
                        v_name = '${v_name}',
                        fk_category = ${fk_category},
                        b_hasformula = ${b_hasformula},
                        b_hasstock = ${b_hasstock},
                        fk_unit = ${fk_unit},
                        v_unit_variance = '${v_unit_variance}',
                        i_qtyalert = ${i_qtyalert},
                        v_notes = '${v_notes}',
                        b_showinplatform = ${b_showinplatform},
                        b_recommendation = ${b_recommendation}
                    WHERE
                        i_code = ${i_code}
                    `
        functionGlobal.query(query, res, connection, 'function/master/item/update', resolve)
    })
}