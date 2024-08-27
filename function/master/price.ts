import * as typeGlobal from '../../type/global'
import * as functionGlobal from '../global_function'
import { ResultSetHeader } from 'mysql2';

type getV3 = {
    fee: number
}
export async function getV3({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<Array<getV3>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 2), '0') AS mode2,
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 2), '0') AS mode3,
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 2), '0') AS mode4,
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 2), '0') AS mode5,
                        IFNULL((SELECT a.v_name FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 2), '') AS price2,
                        IFNULL((SELECT a.v_name FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 3), '') AS price3,
                        IFNULL((SELECT a.v_name FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 4), '') AS price4,
                        IFNULL((SELECT a.v_name FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 5), '') AS price5,
                        IFNULL((SELECT a.b_isactive FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 2), '0') AS useprice2,
                        IFNULL((SELECT a.b_isactive FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 3), '0') AS useprice3,
                        IFNULL((SELECT a.b_isactive FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 4), '0') AS useprice4,
                        IFNULL((SELECT a.b_isactive FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 5), '0') AS useprice5`
        functionGlobal.query(query, res, connection, 'function/master/price/getV3', resolve)
    })
}

export async function insert({res, connection}: typeGlobal.functions, {fk_business, v_name, i_position, b_type, b_automatic, b_isactive}: {fk_business: number, v_name: string, i_position: number, b_type: number, b_automatic: number, b_isactive: number}) {
    return new Promise((resolve, reject) => {
        let query = `
                    INSERT INTO dvw_master.vw_price(fk_business, v_name, i_position, b_type, b_automatic, b_isactive)
                    VALUES (${fk_business}, '${v_name}', ${i_position}, ${b_type}, ${b_automatic}, ${b_isactive})
                    `
        functionGlobal.query(query, res, connection, 'function/master/price/insertPrice', resolve)                     
    })
}

export async function update({res, connection}: typeGlobal.functions, {fk_business, v_name, b_type, b_automatic, b_isactive, i_position}: {fk_business: number, v_name: string, b_type: number, b_automatic: number, b_isactive: number, i_position: number}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE dvw_master.vw_price SET
                        v_name = '${v_name}',
                        b_type = ${b_type},
                        b_automatic = ${b_automatic},
                        b_isactive = ${b_isactive}
                    WHERE fk_business = ${fk_business} AND i_position = ${i_position}
                    `
        functionGlobal.query(query, res, connection, 'function/master/price/update', resolve)
    })
}

type getModes = {
    mode2: number,
    mode3: number,
    mode4: number,
    mode5: number
}
export async function getModes({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getModes> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 2), 0) AS mode2,
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 3), 0) AS mode3,
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 4), 0) AS mode4,
                        IFNULL((SELECT 1 FROM dvw_master.vw_price a WHERE a.fk_business = ${fk_business} AND a.i_position = 5), 0) AS mode5
                    `
        functionGlobal.querySingle(query, res, connection, 'function/master/price/getModes', resolve)
    })
}