import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

export async function insertItem(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_cart, fk_item, fk_unit, qty, price, preference, createdby,
        dt_created, isvoid, dt_void, voidby, isprinted, type, ispaid, voidreason
    }   : {
            fk_business: number, fk_cart: number, fk_item: number, fk_unit: number,
            qty: number, price: number, preference: string, createdby: string,
            dt_created: string, isvoid: number, dt_void: string, voidby: string,
            isprinted: number, type: number, ispaid: number, voidreason: string
        }
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_cartdetail (fk_business, fk_cart, fk_item, fk_unit, i_qty, i_price, v_preference, v_createdby, dt_created, b_isvoid, dt_void, v_voidby, b_isprinted, b_type, b_ispaid, v_voidreason)
                    VALUES (${fk_business}, ${fk_cart}, ${fk_item}, ${fk_unit}, ${qty}, ${price}, '${preference}', '${createdby}', '${dt_created}', ${isvoid}, '${dt_void}', '${voidby}', ${isprinted}, ${type}, ${ispaid}, '${voidreason}')`
        functionGlobal.query(query, res, connection, 'function/transaction/cartdertail/insert', resolve)
    })
}

export async function insertPackage(
    {res, connection}: typeGlobal.functions,
    {
        fk_business, fk_cart, fk_package, qty, createdby, dt_created, isvoid
    }   : {
            fk_business: number, fk_cart: number, fk_package: number, qty: number, createdby: string,
            dt_created: string, isvoid: number
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_cartdetail (fk_business, fk_cart, fk_item, fk_unit, i_qty, i_price, v_preference, v_createdby, dt_created, b_isvoid, b_type)
                    SELECT
                            ${fk_business},
                            ${fk_cart},
                            a.fk_item,
                            0,
                            a.i_qty * ${qty},
                            0,
                            '',
                            '${createdby}',
                            '${dt_created}',
                            ${isvoid},
                            3
                    FROM dvw_master.vw_packagedetail a
                    WHERE a.fk_package = ${fk_package};`
        functionGlobal.query(query, res, connection, 'function/transaction/cartdetail/insertPackage', resolve)
    })
}

export function updateVoid({res, connection}: typeGlobal.functions, {i_code, v_voidby, v_voidreason}: {i_code: number, v_voidby: string, v_voidreason: string}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_transaction.vw_cartdetail SET
                        b_isvoid = 1,
                        v_voidby = '${v_voidby}',
                        v_voidreason = '${v_voidreason}',
                        dt_void = NOW()
                    WHERE b_isvoid = 0
                        AND i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/transaction/cartdetail/updateVoid', resolve)
    })
}

type getFKCart = {
    cart: number
}
export function getFKCart({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}): Promise<getFKCart> {
    return new Promise((resolve, reject) => {
        let query = `SELECT fk_cart AS 'cart'
                    FROM dvw_transaction.vw_cartdetail a
                    WHERE a.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/transaction/cartdetail/getFKCart', resolve)
    })
}

type getCodeQTYPrice = {
    code: number,
    qty: number,
    price: number
}
export function getCodeQTYPrice({res, connection}: typeGlobal.functions, {fk_cart}: {fk_cart: number}): Promise<Array<getCodeQTYPrice>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS 'code',
                        a.i_qty AS 'qty',
                        a.i_price AS 'price'
                    FROM dvw_transaction.vw_cartdetail a
                    WHERE a.fk_cart = ${fk_cart}
                        AND a.b_isactive = 1
                        AND a.b_isvoid = 0`
        functionGlobal.query(query, res, connection, 'function/transaction/cartdetail/getCodeQTYPrice', resolve)
    })
}