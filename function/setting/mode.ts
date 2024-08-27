import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type getQRISType = {
    qris_type: number
}
export async function getQRISType({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getQRISType> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                            a.i_qris_type AS 'qris_type'
                        FROM dvw_setting.vw_mode a
                        WHERE a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/setting/mode/getQRISType', resolve)
    })
}

export function select({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                        FROM dvw_setting.vw_mode a
                        WHERE a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/setting/mode/select', resolve)
    })
}

export function updateOrderOnlineQrisManual({res, connection}: typeGlobal.functions, {fk_business, b_order_online, b_qris, b_manual}: {fk_business: number, b_order_online: number, b_qris: number, b_manual: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_setting.vw_mode SET
                        b_order_online = ${b_order_online},
                        b_qris = ${b_qris},
                        b_manual = ${b_manual}
                    WHERE fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/setting/mode/updateOrderOnlineQrisManual', resolve)
    })
}

export function insert({res, connection}: typeGlobal.functions, {fk_business, b_order_online, b_qris, b_manual}: {fk_business: number, b_order_online: number, b_qris: number, b_manual: number}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_setting.vw_mode
                    SET
                        fk_business = ${fk_business},
                        b_order_online = ${b_order_online},
                        b_qris = ${b_qris},
                        b_manual = ${b_manual}
                    `
        functionGlobal.query(query, res, connection, 'function/setting/mode/insert', resolve)
    })
}