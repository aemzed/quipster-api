import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

type get = {
    code: number,
    type: number,
    item_material_code: number,
    item_material_name: string,
    item_material_sku: string,
    qty: number,
    price: number,
    price_sell: number
    promotion_type: number,
    promotion_value: number
}
export async function get({res, connection}: typeGlobal.functions, {fk_business, fk_purchaseorder}: {fk_business: number, fk_purchaseorder: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS 'code',
                        a.b_type AS 'type',
                        a.fk_itemmaterial AS 'item_material_code',
                        CASE
                            WHEN a.b_type = 1 THEN (SELECT z.v_name FROM dvw_master.vw_item z WHERE z.i_code = a.fk_itemmaterial)
                            WHEN a.b_type = 2 THEN (SELECT z.v_name FROM dvw_master.vw_material z WHERE z.i_code = a.fk_itemmaterial)
                        END AS 'item_material_name',
                        CASE
                            WHEN a.b_type = 1 THEN (SELECT z.v_code FROM dvw_master.vw_item z WHERE z.i_code = a.fk_itemmaterial)
                            WHEN a.b_type = 2 THEN ''
                        END AS 'item_material_sku',
                        a.i_qty AS 'qty',
                        a.i_price AS 'price',
                        a.i_price_adjusted AS 'adjusted_price',
                        a.i_price_sell AS 'price_sell',
                        IFNULL(a.i_discount,0) AS 'promotion_type',
                        IFNULL(a.i_discountnominal,0) AS 'promotion_value',
                        CASE
                            WHEN a.b_type = 1 THEN 
                            (
                                SELECT y.v_name 
                                FROM dvw_master.vw_item z 
                                JOIN dvw_master.vw_unit y ON z.fk_unit = y.i_code
                                WHERE z.i_code = a.fk_itemmaterial
                            )
                            WHEN a.b_type = 2 THEN 
                            (
                                SELECT y.v_name 
                                FROM dvw_master.vw_material z 
                                JOIN dvw_master.vw_unit y ON z.fk_unit = y.i_code
                                WHERE z.i_code = a.fk_itemmaterial
                            )
                        END AS 'unit',
                        a.v_notes AS 'notes',
                        a.dt_adjusted AS 'date_adjusted'
                    FROM dvw_operational.vw_purchaseorderdetail a
                    WHERE a.fk_business = ${fk_business}
                        AND a.fk_purchaseorder = ${fk_purchaseorder}
                    ORDER BY 'item_material_name'`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorderdetail/get', resolve)
    })
}

export async function insertV3({res, connection}: typeGlobal.functions, {fk_business, fk_purchaseorder, fk_itemmaterial, b_type, i_qty, i_price, i_discount, i_discountnominal, i_total, v_notes, fk_user_modify}: {
    fk_business: number,
    fk_purchaseorder: number,
    fk_itemmaterial: number,
    b_type: number,
    i_qty: number,
    i_price: number,
    i_discount: number,
    i_discountnominal: number,
    i_total: number,
    v_notes?: string,
    fk_user_modify: number
}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_operational.vw_purchaseorderdetail
                    SET
                        fk_business = ${fk_business},
                        fk_purchaseorder = ${fk_purchaseorder},
                        fk_itemmaterial = ${fk_itemmaterial},
                        b_type = ${b_type},
                        i_qty = ${i_qty},
                        i_price = ${i_price},
                        i_discount = ${i_discount || 0},
                        i_discountnominal = ${i_discountnominal || 0},
                        i_total = ${i_total || 0},
                        ${v_notes ?
                        `v_notes = '${v_notes}',`
                        :``}
                        fk_user_modify = ${fk_user_modify}
                    `
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorderdetail/insert', resolve)
    })
}

export async function deleteV3({res, connection}: typeGlobal.functions, {fk_purchaseorder, fk_business}: {fk_purchaseorder: number, fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `DELETE FROM 
                        dvw_operational.vw_purchaseorderdetail
                    WHERE 
                        fk_purchaseorder = ${fk_purchaseorder}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorderdetail', resolve)
    })
}

type getItemMaterial = {
    item: number
}
export async function getItemMaterial({res, connection}: typeGlobal.functions, {fk_business, fk_purchaseorder}: {fk_business: number, fk_purchaseorder: number}):Promise<Array<getItemMaterial>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        fk_itemmaterial AS 'item'
                    FROM dvw_operational.vw_purchaseorderdetail a
                    WHERE a.fk_business = ${fk_business}
                        AND a.fk_purchaseorder = ${fk_purchaseorder}
                        AND a.b_type = 1`
        
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorderdetail', resolve)
    })
}

type getMaterial = {
    material : number
}
export async function getMaterial({res, connection}: typeGlobal.functions, {fk_business, fk_purchaseorder}: {fk_business: number, fk_purchaseorder: number}): Promise<Array<getMaterial>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        fk_itemmaterial AS 'material'
                    FROM dvw_operational.vw_purchaseorderdetail a
                    WHERE a.fk_business = ${fk_business}
                        AND a.fk_purchaseorder = ${fk_purchaseorder}
                        AND a.b_type = 2`
        
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorderdetail/getMaterial', resolve)
    })
}
type getPOCodePrice = {
    po_code: number,
    price: number,
    qty: number,
    adjusted_date: string,
    discount_type: number,
    discount_nominal: number,
}
export async function getPOCodePriceQTYDiscount({res, connection}: typeGlobal.functions, {business, code}: {business: number, code: number}): Promise<getPOCodePrice> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_purchaseorder as \`po_code\`,
                        a.i_price as \`price\`,
                        a.i_qty as \`qty\`,
                        a.dt_adjusted as adjusted_date,
                        i_discount as discount_type,
                        i_discountnominal as discount_nominal
                    FROM dvw_operational.vw_purchaseorderdetail a
                    WHERE a.i_code = ${code}
                    AND a.fk_business = ${business}`
        functionGlobal.querySingle(query, res, connection, 'function/operational/purchaseorderdetail/getFKPurchaseOrder', resolve)
    })
}
export async function updatePriceAdjusted({res, connection}: typeGlobal.functions, {code, price_adjusted, fk_user_modify}: {code: number, price_adjusted: number, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE 
                        dvw_operational.vw_purchaseorderdetail 
                    SET
                        i_price_adjusted = ${price_adjusted},
                        dt_adjusted = NOW(),
                        fk_user_modify = ${fk_user_modify}
                    WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorderdetail/updatePriceAdjusted', resolve)
    })
}

type checkAdjusted = {
    code: number
}
export async function checkAdjusted({res, connection}: typeGlobal.functions, {code, fk_purchaseorder}: {code: number,fk_purchaseorder: number}):Promise<Array<checkAdjusted>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT i_code as \`code\`
                    FROM dvw_operational.vw_purchaseorderdetail
                    WHERE dt_adjusted IS NOT NULL
                    AND fk_purchaseorder = ${fk_purchaseorder}
                    AND i_code <> ${code}`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorderdetail/checkAdjusted', resolve)
    })
}