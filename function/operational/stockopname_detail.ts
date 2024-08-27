import * as typeGlobal from "../../type/global"

import * as functionGlobal from "../global_function"

type get = {
    stockopname_id: string
    item_code: number,
    item_type: number,
    item_qty: number,
    item_qty_system: number
}
export function get({res, connection}: typeGlobal.functions, {v_hash}: {v_hash: string}): Promise<get> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        fk_stockopname as stockopname_id,
                        fk_item as item_code,
                        b_type as item_type,
                        i_qty as item_qty,
                        i_qty_system as item_qty_system
                    FROM
                        dvw_operational.vw_stockopname_detail
                    WHERE
                        v_hash = '${v_hash}'`
        functionGlobal.querySingle(query, res, connection, 'function/operational/stockopname_detail', resolve)
    })
}
type getByStockOpnameId = {
    id: string,
    item_id: number,
    item_type: number,
    item_name: string,
    item_qty: number,
    item_price: number,
    item_hpp: number,
    item_qty_system: number,
    date_input: string
}
export function getByStockOpnameId({res, connection}: typeGlobal.functions, {fk_business, fk_stockopname}: {fk_business: number, fk_stockopname: string}): Promise<Array<getByStockOpnameId>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_hash as id,
                        a.fk_item as item_id,
                        a.b_type as item_type,
                        b.v_name as item_name,
                        a.i_qty as item_qty,
                        a.i_price as item_price,
                        a.i_hpp as item_hpp,
                        a.i_qty_system as item_qty_system,
                        a.dt_input as date_input
                    FROM
                        dvw_operational.vw_stockopname_detail a
                    LEFT JOIN
                        dvw_master.vw_item b ON a.fk_item = b.i_code AND b.b_isactive = 1 AND b.fk_business = ${fk_business}
                    WHERE
                        a.fk_stockopname = '${fk_stockopname}'
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stockopname_detail/getByStockOpnameId', resolve)
    })
}

type getUnprocessedItemByItemId = {
    date_created: string,
    item_name: string
}
export function getUnprocessedItemByItemId({res, connection}: typeGlobal.functions, {fk_business, fk_itemS}: {fk_business: number, fk_itemS: Array<number>}): Promise<Array<getUnprocessedItemByItemId>> {
    let generateItemsQueryChecker = fk_itemS.map((fk_item) => `fk_item = ${fk_item}`).join(' OR ')
    return new Promise((resolve, reject) => {
        if (fk_itemS.length === 0) return resolve([])
        let query = `SELECT
                        c.dt_created as date_created,
                        b.v_name as item_name
                    FROM
                        dvw_operational.vw_stockopname_detail a
                    JOIN
                        dvw_master.vw_item b ON a.fk_item = b.i_code AND b.b_isactive = true AND b.fk_business = ${fk_business}
                    JOIN
                        dvw_operational.vw_stockopname c ON a.fk_stockopname = c.v_hash AND c.fk_business = ${fk_business}
                    WHERE
                        dt_input IS NULL
                        ${generateItemsQueryChecker ?
                        `AND (${generateItemsQueryChecker})`
                        : ``}
                    `
        
        functionGlobal.query(query, res, connection, 'function/operational/stockopname_detail/getUnprocessedItemByItemId', resolve)
    })
}

type getUnprocessedItemByMaterialId = {
    date_created: string,
    item_name: string
}
export function getUnprocessedItemByMaterialId({res, connection}: typeGlobal.functions, {fk_business, fk_itemS}: {fk_business: number, fk_itemS: Array<number>}): Promise<Array<getUnprocessedItemByItemId>> {
    let generateItemsQueryChecker = fk_itemS.map((fk_item) => `fk_item = ${fk_item}`).join(' OR ')
    return new Promise((resolve, reject) => {
        if (fk_itemS.length === 0) return resolve([])
        let query = `SELECT
                        c.dt_created as date_created,
                        b.v_name as item_name
                    FROM
                        dvw_operational.vw_stockopname_detail a
                    JOIN
                        dvw_master.vw_material b ON a.fk_item = b.i_code AND b.b_isactive = true AND b.fk_business = ${fk_business}
                    JOIN
                        dvw_operational.vw_stockopname c ON a.fk_stockopname = c.v_hash AND c.fk_business = ${fk_business}
                    WHERE
                        dt_input IS NULL
                        ${generateItemsQueryChecker ?
                        `AND (${generateItemsQueryChecker})`
                        : ``}
                    `
        
        functionGlobal.query(query, res, connection, 'function/operational/stockopname_detail/getUnprocessedItemByMaterialId', resolve)
    })
}

export async function getReportStockOpnameDetail({res, connection}: typeGlobal.functions, {fk_stockopname}: {fk_stockopname: string}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_hash AS \`hash\`,
                        b.i_code AS \`item_code\`,
                        b.v_code AS \`item_sku\`,
                        b.v_name AS \`item_name\`,
                        a.i_qty AS \`qty\`,
                        a.i_qty_system AS \`qty_system\`,
                        a.i_price AS \`price\`,
                        a.i_hpp AS \`hpp\`,
                        a.dt_input AS \`dates\`,
                        '0' AS \`can_edit\`
                    FROM dvw_operational.vw_stockopname_detail a
                    JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                    WHERE a.fk_stockopname = '${fk_stockopname}'`
        functionGlobal.query(query, res, connection, 'function/operational/stockopname/getReportStockOpnameDetail', resolve)
    })
}

export function insert({res, connection}: typeGlobal.functions, {v_hash, fk_stockopname, fk_item, i_qty, dt_input, b_type}: {v_hash: string, fk_stockopname: string, fk_item: number, i_qty?: number, dt_input?: string, b_type: number}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO
                        dvw_operational.vw_stockopname_detail
                    SET
                        ${i_qty ?
                        `i_qty = ${i_qty},`
                        :``}
                        ${dt_input ?
                        `dt_input = ${dt_input},`
                        :``}
                        b_type = ${b_type},
                        v_hash = '${v_hash}',
                        fk_stockopname = '${fk_stockopname}',
                        fk_item = ${fk_item}
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stockopname_detail/insert', resolve)
    })
}

export function updateQTYNDateinput({res, connection}: typeGlobal.functions, {v_hash, i_qty, dt_input}: {v_hash: string, i_qty: number, dt_input: string}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE
                        dvw_operational.vw_stockopname_detail
                    SET
                        i_qty = ${i_qty},
                        dt_input = '${dt_input}'
                    WHERE
                        v_hash = '${v_hash}'
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stockopname_detail/updateQTY', resolve)
    })
}

type getQTYDifferent = {
    difference: number
}
export function getQTYDifferent({res, connection}: typeGlobal.functions, {v_hash}: {v_hash: string}): Promise<getQTYDifferent> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        (qty_system - qty) as difference
                    FROM
                        dvw_operational.vw_stockopname_detail
                    WHERE
                        v_hash = '${v_hash}'`
        functionGlobal.querySingle(query, res, connection, 'function/operational/stockopname_detail', resolve)
    })
}

type getItemNQtyNQtysystem = {
    item_code: number,
    qty: number,
    qty_system: number
}
export function getItemNQtyNQtysystem({res, connection}: typeGlobal.functions, {v_hash}: {v_hash: string}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        fk_item,
                        i_qty,
                        i_qty_system
                    FROM
                        dvw_operational.vw_stockopname_detail
                    WHERE
                        v_hash = '${v_hash}'`
        functionGlobal.query(query, res, connection, 'function/operational/getItemNQtyNQtysystem', resolve)
    })
}

type getUnprocessedItemByFKStockOpname = {
    id: string
}
export function getUnprocessedItemByFKStockOpname({res, connection}: typeGlobal.functions, {fk_stockopname}: {fk_stockopname: string}): Promise<Array<getUnprocessedItemByFKStockOpname>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        v_hash
                    FROM
                        dvw_operational.vw_stockopname_detail
                    WHERE
                        fk_stockopname = '${fk_stockopname}'
                        AND dt_input IS NULL
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stockopname_detail/getUnprocessedItemByFKStockOpname', resolve)
    })
}