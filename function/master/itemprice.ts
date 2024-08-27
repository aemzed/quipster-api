import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

export async function softDelete({res, connection}: typeGlobal.functions, {fk_user_modify, fk_business, fk_item}: {fk_user_modify: number, fk_business: number, fk_item: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_itemprice SET
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE fk_business = ${fk_business}
                        AND fk_item = ${fk_item}`
                        
        functionGlobal.query(query, res, connection, 'function/master/itemprice/softDelete', resolve)
    })
}

type insert = ResultSetHeader
export async function insert({res, connection}: typeGlobal.functions, {
    fk_user_modify, fk_business, fk_item, hpp, price, price2, price3, price4, price5, point
} : {fk_user_modify: number, fk_business: number, fk_item: number, hpp: number, price: number, price2: number, price3: number, price4: number, price5: number, point: number}): Promise<insert> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_master.vw_itemprice
                    SET
                        fk_user_modify = ${fk_user_modify},
                        fk_business = ${fk_business},
                        fk_item = ${fk_item},
                        i_hpp = ${hpp},
                        i_price = ${price},
                        i_price2 = ${price2},
                        i_price3 = ${price3},
                        i_price4 = ${price4},
                        i_price5 = ${price5},
                        i_point = ${point},
                        b_usetrigger = 1,
                        v_notes = 'Perubahan HPP formula'`
        functionGlobal.query(query, res, connection, 'function/master/itemprice/insert', resolve)
    })
}

type getReportPriceItem = {
    item_name: any,
    hpp: any,
    price1: any,
    price2: any,
    price3: any,
    price4: any,
    price5: any,
    point: any,
    notes: any,
    date: any
}
export async function getReportPriceItem({res, connection}: typeGlobal.functions, {fk_business, dt_created, vw_item}: {fk_business: number, dt_created: {date_start: string, date_end: string}, vw_item: {i_code: number | '%'}}): Promise<Array<getReportPriceItem>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        b.v_name AS \`item_name\`,
                        a.i_hpp AS \`hpp\`,
                        a.i_price AS \`price1\`,
                        a.i_price2 AS \`price2\`,
                        a.i_price3 AS \`price3\`,
                        a.i_price4 AS \`price4\`,
                        a.i_price5 AS \`price5\`,
                        IFNULL(a.i_point, 0) AS \`point\`,
                        a.v_notes AS \`notes\`,
                        a.dt_created AS \`date\`
                    FROM dvw_master.vw_itemprice a
                    JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND date(a.dt_created) >= '${dt_created.date_start}'
                        AND date(a.dt_created) <= '${dt_created.date_end}'
                        AND b.i_code LIKE '${vw_item.i_code}'
                    ORDER BY a.dt_created`
        functionGlobal.query(query, res, connection, 'function/master/itemprice/getReportPriceItem', resolve)
    })
}

export function productInsert({res, connection}: typeGlobal.functions, {fk_business, fk_item, i_hpp, i_price, i_price2, i_price3, i_price4, i_price5, i_point}: {fk_business: number, fk_item: number, i_hpp: number, i_price: number, i_price2: number, i_price3: number, i_price4: number, i_price5: number, i_point: number}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_itemprice SET
                    fk_business = ${fk_business},
                    fk_item = ${fk_item},
                    i_hpp = ${i_hpp},
                    i_price = ${i_price},
                    i_price2 = ${i_price2},
                    i_price3 = ${i_price3},
                    i_price4 = ${i_price4},
                    i_price5 = ${i_price5},
                    i_point = ${i_point}`
        functionGlobal.query(query, res, connection, 'function/master/itemprice/insert', resolve)
    })
}