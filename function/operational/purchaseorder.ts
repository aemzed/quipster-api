import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

import * as functionPurchaseOrderDetail from "./purchaseorderdetail"

export async function select({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {start_date: string, end_date: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS 'code',
                        a.v_code AS 'receipt',
                        b.i_code AS 'supplier_code',
                        b.v_name AS 'supplier_name',
                        a.dt_order AS 'date_order',
                        a.dt_received AS 'date_received',
                        a.dt_paid AS 'date_paid',
                        IFNULL(a.dt_void, '') AS 'date_void',
                        a.i_price AS 'subtotal',
                        a.i_price_adjusted as 'adjusted_subtotal',
                        a.i_discount AS 'discount',
                        a.i_tax AS 'tax',
                        a.i_extracharge AS 'extra',
                        a.i_pricenet AS 'total',
                        a.i_pricenet_adjusted AS 'adjusted_total',
                        a.v_notes AS 'notes',
                        a.b_isconfirm AS 'confirm',
                        a.b_ispaid AS 'paid',
                        a.v_image AS 'attacment',
                        IFNULL((
                            SELECT SUM(z.i_qty)
                            FROM dvw_operational.vw_purchaseorderdetail z
                            WHERE z.fk_purchaseorder = a.i_code
                        ),0) AS 'total_item'
                    FROM dvw_operational.vw_purchaseorder a
                    JOIN dvw_master.vw_supplier b ON a.fk_supplier = b.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND DATE(a.dt_order) >= '${dt_created.start_date}'
                        AND DATE(a.dt_order) <= '${dt_created.end_date}'
                        AND a.b_isactive = 1
                    ORDER BY confirm ASC, date_order DESC`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/select', resolve)
    })
}

type getPurchaseOrder = {
    i_code: number,
    fk_business: number,
    fk_supplier: number,
    v_code: string,
    v_receipt: string,
    i_price: number,
    i_price_adjusted: number,
    i_tax: number,
    i_tax_adjusted: number,
    i_discount: number,
    i_discount_adjusted: number,
    i_pricenet: number,
    i_pricenet_adjusted: number,
    i_extracharge: number,
    dt_order: string,
    dt_paid: string,
    dt_received: string,
    b_ispaid: number
    b_isconfirm: number,
    v_notes: string,
    v_image: string,
    dt_created: string,
    b_isactive: number
}
export async function getPurchaseOrder({res, connection}: typeGlobal.functions, {fk_business, code}: {fk_business: number, code: number}): Promise<getPurchaseOrder> {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                FROM dvw_operational.vw_purchaseorder a
                WHERE a.fk_business = ${fk_business}
                    AND a.i_code = ${code}
                    AND a.b_isconfirm = 1`
        
        functionGlobal.querySingle(query, res, connection, 'function/operational/purchaseorder/getPurchaseOrder', resolve)
    })
}

type getSupplierAndTax = {
    supplier_code: number,
    supplier_name: string,
    tax: number,
    date_void: string
}
export function getSupplierAndTax({res, connection}: typeGlobal.functions, {fk_business, code}: {fk_business: number, code: number}): Promise<getSupplierAndTax> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.fk_supplier AS 'supplier_code',
                        IFNULL(b.v_name, '') AS 'supplier_name',
                        a.i_tax AS 'tax',
                        IFNULL(a.dt_void, '') AS 'date_void'
                    FROM dvw_operational.vw_purchaseorder a
                    LEFT JOIN dvw_master.vw_supplier b ON a.fk_supplier = b.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND a.i_code = ${code}`
        functionGlobal.querySingle(query, res, connection, 'function/operational/purchaseorder/getsupplierandtax', resolve)
    })
}

export function insert({res, connection}: typeGlobal.functions, {fk_business, fk_supplier, v_receipt, i_price, i_tax, i_discount, i_pricenet, i_extracharge, dt_order, b_isconfirm, v_notes, fk_user_modify} : {
    fk_business: number,
    fk_supplier: number,
    v_receipt: string,
    i_price: number,
    i_tax: number,
    i_discount: number,
    i_pricenet: number,
    i_extracharge: number,
    dt_order: string,
    b_isconfirm?: number,
    v_notes: string,
    fk_user_modify: number
}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_operational.vw_purchaseorder
                    SET
                        fk_business = ${fk_business}, 
                        fk_supplier = ${fk_supplier}, 
                        v_receipt = '${v_receipt}', 
                        i_price = ${i_price}, 
                        i_tax = ${i_tax}, 
                        i_discount = ${i_discount}, 
                        i_pricenet = ${i_pricenet}, 
                        i_extracharge = ${i_extracharge}, 
                        dt_order = '${dt_order}', 
                        ${b_isconfirm ? 
                        `b_isconfirm = ${b_isconfirm},`
                        : `` }
                        v_notes = '${v_notes}',
                        fk_user_modify = ${fk_user_modify}
                    `
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/insert', resolve)
    })
}

export function updateV3({res, connection}: typeGlobal.functions, {fk_business, i_code, fk_supplier, v_receipt, i_price, i_tax, i_discount, i_pricenet, i_extracharge, dt_order, v_notes, fk_user_modify} : {
    fk_business: number,
    i_code: number,
    fk_supplier: number,
    v_receipt: string,
    i_price: number,
    i_tax: number,
    i_discount: number,
    i_pricenet: number,
    i_extracharge: number,
    dt_order: string,
    v_notes: string,
    fk_user_modify: number
}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_purchaseorder SET
                        fk_supplier = ${fk_supplier},
                        v_receipt = '${v_receipt}',
                        i_price = ${i_price},
                        i_tax = ${i_tax},
                        i_discount = ${i_discount},
                        i_pricenet = ${i_pricenet},
                        i_extracharge = ${i_extracharge},
                        dt_order = '${dt_order}',
                        v_notes = '${v_notes}',
                        fk_user_modify = ${fk_user_modify}
                    WHERE fk_business = ${fk_business}
                        AND i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/updateV3', resolve)
    })
}

export async function softDelete({res, connection}: typeGlobal.functions, {code, fk_user_modify} : {code: number, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_purchaseorder SET
                        b_isactive = 0,
                        fk_user_modify = ${fk_user_modify}
                    WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, "function/operational/purchaseorder/softDelete", resolve)
    })
}

export async function updateIsConfirm({res, connection}: typeGlobal.functions, {dt_received, code, fk_user_modify}: {dt_received: string, code: number, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_purchaseorder SET
                        b_isconfirm = 1,
                        dt_received = '${dt_received}',
                        fk_user_modify = ${fk_user_modify}
                    WHERE i_code = ${code}`
        
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/updateIsConfirm', resolve)
    })
}

export async function updateIsPaid({res, connection}: typeGlobal.functions, {dt_paid, code, fk_user_modify}: {dt_paid: string, code: number, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_purchaseorder SET
                        b_ispaid = 1,
                        dt_paid = '${dt_paid}',
                        fk_user_modify = ${fk_user_modify}
                    WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/updateIsPaid', resolve)
    })
}

export async function updatePriceAdjustedDiscountAdjusted({res, connection}: typeGlobal.functions, {code, fk_user_modify}: {code: number, fk_user_modify: number}) {
    return new Promise(async (resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_purchaseorder a 
                    SET a.i_price_adjusted = (
                                            SELECT 
                                                SUM (
                                                    CASE
                                                        WHEN aa.dt_adjusted IS NOT NULL THEN (aa.i_qty * aa.i_price_adjusted)
                                                        ELSE (aa.i_qty * aa.i_price)
                                                    END
                                                ) AS subtotal
                                            FROM dvw_operational.vw_purchaseorderdetail aa
                                            WHERE aa.fk_purchaseorder = ${code}
                                            ),
                        a.i_discount_adjusted = (
                                                SELECT 
                                                    SUM(
                                                        CASE
                                                            WHEN aa.i_discount = 1 THEN (IF (aa.dt_adjusted IS NOT NULL, aa.i_price_adjusted, aa.i_price)) * aa.i_qty * aa.i_discountnominal / 100
                                                            ELSE aa.i_discountnominal
                                                        END
                                                    ) AS discounttotal
                                                FROM dvw_operational.vw_purchaseorderdetail aa
                                                WHERE aa.fk_purchaseorder = ${code}
                                                ),
                        fk_user_modify = ${fk_user_modify}
                    WHERE a.i_code = ${code}
                    `
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/updatePriceAdjustedDiscountAdjusted', resolve)
    })
}

export async function updateTaxAdjusted({res, connection}: typeGlobal.functions, {code, fk_user_modify}: {code: number, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE 
                        dvw_operational.vw_purchaseorder a
                    SET 
                        a.i_tax_adjusted = (a.i_price_adjusted - a.i_discount_adjusted) * (a.i_tax / (a.i_price - a.i_discount)),
                        fk_user_modify = ${fk_user_modify}
                    WHERE 
                        a.i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/updateTaxAdjusted', resolve)
    })
}

export async function updatePricenetAdjusted({res, connection}: typeGlobal.functions, {code, fk_user_modify}: {code: number, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE 
                        dvw_operational.vw_purchaseorder a
                    SET 
                        a.i_pricenet_adjusted = a.i_price_adjusted + a.i_tax_adjusted - a.i_discount_adjusted,
                        fk_user_modify = ${fk_user_modify}
                    WHERE a.i_code = ${code}`
       functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/updatePricenetAdjusted', resolve)
    })
}

type getReportPurchaseOrderDetail = {
    receipt: string,
    date_void: string,
    date: string,
    item_sku: string,
    item_name: string,
    price: number,
    price_sell: number,
    qty: number
}
export async function getReportPurchaseOrderDetail({res, connection}: typeGlobal.functions, {fk_business, dt_received}: {fk_business: number, dt_received: {start_date: string, end_date: string}}):Promise<Array<getReportPurchaseOrderDetail>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_code AS \`receipt\`,
                        a.dt_void AS \`date_void\`,
                        DATE(dt_received) AS \`date\`,
                        c.v_code AS \`item_sku\`,
                        c.v_name AS \`item_name\`,
                        b.i_price AS \`price\`,
                        b.i_price_sell AS \`price_sell\`,
                        b.i_qty AS \`qty\`
                    FROM dvw_operational.vw_purchaseorder a
                    JOIN dvw_operational.vw_purchaseorderdetail b ON b.fk_purchaseorder = a.i_code AND b.b_type = 1
                    JOIN dvw_master.vw_item c ON b.fk_itemmaterial = c.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND a.b_isconfirm = 1
                        AND a.b_isactive = 1
                        AND DATE(dt_received) >= '${dt_received.start_date}'
                        AND DATE(dt_received) <= '${dt_received.end_date}'`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/getReportPurchaseOrderDetail', resolve)
    })
}

export async function getReportPurchaseOrderSummary({res, connection}: typeGlobal.functions, {fk_business, dt_received}: {fk_business: number, dt_received: {start_date: string, end_date: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        DATE(dt_received) AS \`date\`,
                        SUM(b.i_price * b.i_qty) AS \`price\`,
                        SUM(b.i_price_sell * b.i_qty) AS \`price_sell\`,
                        SUM(b.i_qty) AS \`qty\`
                    FROM dvw_operational.vw_purchaseorder a
                    JOIN dvw_operational.vw_purchaseorderdetail b ON b.fk_purchaseorder = a.i_code AND b.b_type = 1
                    WHERE a.fk_business = ${fk_business}
                        AND a.b_isconfirm = 1
                        AND a.b_isactive = 1
                        AND DATE(dt_received) >= '${dt_received.start_date}'
                        AND DATE(dt_received) <= '${dt_received.end_date}'
                    GROUP BY DATE(dt_received)`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/getReportPurchaseOrderSummary', resolve)
    })
}

type getConfirmed = {
    confirmed: number
}
export function getConfirmed({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}):Promise<getConfirmed> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        b_isconfirm as confirmed
                    FROM
                        dvw_operational.vw_purchaseorder
                    WHERE
                        i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/operational/purchaseorder/getConfirmed', resolve)
    })
}

export function updateDatevoid({res, connection}: typeGlobal.functions, {i_code, dt_void, fk_user_modify}: {i_code: number, dt_void: string, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE
                        dvw_operational.vw_purchaseorder
                    SET
                        dt_void = '${dt_void}',
                        fk_user_modify = '${fk_user_modify}'
                    WHERE
                        i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/operational/purchaseorder/updateDatevoid', resolve)
    })
}