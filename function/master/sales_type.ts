import * as functionGlobal from '../global_function'
import * as typeGlobal from '../../type/global'
import { ResultSetHeader } from 'mysql2'
import { type } from 'os'

type getSalesTypeCode = {
    salesTypeCode: number
}
export async function getSalesTypeCode({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getSalesTypeCode> {
    return new Promise( async (resolve, reject) => {
        type queryResult = {
            code: number,
        }
        let query = `SELECT 
                        z.i_code AS "code"
                    FROM dvw_master.vw_salestype z 
                    WHERE z.fk_business = ${fk_business}
                    LIMIT 1`
        let result: queryResult = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/salestype/getSalesTypeCode', resolve))
        resolve(<getSalesTypeCode>{
            salesTypeCode: result.code
        })
    })
}

type getSalesTypeSelect = {
    code: string,
    name: string,
    system: string,
    tax: string,
    sc: string,
    price_1: number,
    price_2: number,
    price_3: number,
    price_4: number,
    price_5: number
}
export async function get({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name?: string}, {keyword, name, start = 0, limit, order = "\`name\`"}: typeGlobal.selectOptions): Promise<Array<getSalesTypeSelect>> {
    return new Promise((resolve, reject) => {
        let query = `   SELECT
                            i_code AS code,
                            v_name AS name,
                            fk_systemsalestype AS system,
                            b_tax AS tax,
                            b_sc AS sc,
                            b_price_1 AS price_1,
                            b_price_2 AS price_2,
                            b_price_3 AS price_3,
                            b_price_4 AS price_4,
                            b_price_5 AS price_5
                        FROM dvw_master.vw_salestype
                        WHERE b_isactive = 1
                            AND fk_business = ${fk_business}
                            ${v_name ?
                            `AND v_name = '${v_name}'`
                            : ``}
                            ${keyword ?
                            `AND v_name LIKE '%${keyword}%'`
                            :``}
                        ORDER BY ${order}
                        ${limit ?
                        `LIMIT ${start}, ${limit}`
                        : ``}`
        functionGlobal.query(query, res, connection, 'function/master/salestype/getSalesTypeSelect', resolve)
    })
}

export async function insert({res, connection}: typeGlobal.functions, {fk_business, v_name, fk_systemsalestype, b_tax, b_sc, fk_user_modify}: {fk_business: number, v_name: string, fk_systemsalestype: number, b_tax?: number, b_sc?: number, fk_user_modify: number}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO
                        dvw_master.vw_salestype
                    SET
                        fk_business = ${fk_business},
                        v_name = '${v_name}',
                        fk_systemsalestype = ${fk_systemsalestype}
                        ${b_tax ? 
                        `,b_tax = ${b_tax}`
                        :``}
                        ${b_sc ? 
                        `,b_sc = ${b_sc}`
                        :``}
                        ,fk_user_modify = ${fk_user_modify}`
        functionGlobal.query(query, res, connection, 'function/master/sales_type/insert', resolve)
    })
}

export async function update({res, connection}: typeGlobal.functions, {i_code, fk_business, v_name, fk_systemsalestype, b_tax, b_sc, fk_user_modify}: {i_code: number, fk_business: number, v_name?: string, fk_systemsalestype?: number, b_tax?: number, b_sc?: number, fk_user_modify: number}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE
                        dvw_master.vw_salestype
                    SET
                        ${v_name ?
                        `v_name = '${v_name}',`
                        : ``}
                        ${fk_systemsalestype ?
                        `fk_systemsalestype = ${fk_systemsalestype},`
                        : ``}
                        ${b_tax ? 
                        `b_tax = ${b_tax},`
                        : ``}
                        ${b_sc ? 
                        `b_sc = ${b_sc},`
                        : ``}
                        fk_user_modify = ${fk_user_modify}
                    WHERE i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/master/sales_type/update', resolve)
    })
}

type softDelete = ResultSetHeader
export async function softDelete({res, connection}: typeGlobal.functions, {fk_business, i_code, fk_user_modify}: {fk_business: number, i_code: number, fk_user_modify: number}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE
                        dvw_master.vw_salestype
                    SET
                        b_isactive = 0,
                        fk_user_modify = ${fk_user_modify}
                    WHERE 
                        i_code = ${i_code}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/sales_type/del', resolve)
    })
}

type getSystem = {
    code: number,
    name: string
}
export async function getSystem({res, connection}: typeGlobal.functions) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_name AS \`name\`
                    FROM dvw_system.vw_salestype a
                    WHERE a.b_isactive = 1
                    ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/master/sales_type/getSystem', resolve)
    })
}