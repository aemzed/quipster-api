import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global'
import * as type from '../../type/absence_type'
import { ResultSetHeader } from 'mysql2';


export function get<T extends type.absenceType | type.absenceType[]>({connection, res, business, code="%", code_exclude="0", name="%", where_extend = ""}:  typeGlobal.functions & typeGlobal.functionsGetDefault & {business: string, where_extend?: string}): Promise<T> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.i_code AS 'code',
                            a.v_name AS 'name',
                            a.i_start_hour AS 'start_hour',
                            a.i_start_minute AS 'start_minute',
                            a.i_end_hour AS 'end_hour',
                            a.i_end_minute AS 'end_minute',
                            a.i_zone AS 'zone'
                        FROM dvw_master.vw_absence_type a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${business}
                            AND a.i_code <> ${code_exclude}
                            AND a.i_code LIKE '${code}'
                            AND a.v_name LIKE '${name}'
                            ${where_extend}
                        ORDER BY a.v_name`

        if(code == "%" && name == "%") functionGlobal.query(query, res, connection, 'function/absence_type/get', resolve);
        else functionGlobal.querySingle(query, res, connection, 'function/absence_type/get', resolve);

    })
}


export function insert({connection, res, data}:  typeGlobal.functions & {data: type.insert}) {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO 
                            dvw_master.vw_absence_type
                        SET
                            fk_business = ${data.business},
                            v_name = ${data.name},
                            i_start_hour = ${data.start_hour},
                            i_start_minute = ${data.start_minute},
                            i_end_hour = ${data.end_hour},
                            i_end_minute = ${data.end_minute},
                            i_zone = ${data.zone}
                        `

        functionGlobal.query(query, res, connection, 'function/absence_type/insert', resolve);
    })
}


export function update({connection, res, data}:  typeGlobal.functions & {data: type.update}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE dvw_master.vw_absence_type SET
                            v_name = '${data.name}',
                            i_start_hour = ${data.start_hour},
                            i_start_minute = ${data.start_minute},
                            i_end_hour = ${data.end_hour},
                            i_end_minute = ${data.end_minute},
                            i_zone = ${data.zone}
                        WHERE i_code = ${data.code}`

        functionGlobal.query(query, res, connection, 'function/absence_type/update', resolve);
    })
}


export function del({connection, res, data}:  typeGlobal.functions & {data: type.del}) {
    return new Promise(function(resolve, reject) {
        let query = ` UPDATE dvw_master.vw_preference SET
                            b_isactive = 0
                            WHERE i_code = ${data.code}`;

        functionGlobal.query(query, res, connection, 'function/absence_type/del', resolve);
    })
}

type getV3 = {
    code: number,
    name: string,
    start_hour: number,
    start_menitu: number,
    end_hour: number,
    end_minute: number,
    zone: number
}
export async function getV3({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }, sortandfilter: typeGlobal.sortAndFilter): Promise<Array<getV3>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                            a.i_code AS code,
                            a.v_name AS name,
                            a.i_start_hour AS start_hour,
                            a.i_start_minute AS start_minute,
                            a.i_end_hour AS end_hour,
                            a.i_end_minute AS end_minute,
                            a.i_zone AS zone
                        FROM dvw_master.vw_absence_type a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            ${sortandfilter.name ?
                            `AND a.v_name = ${sortandfilter.name}`
                            : ``}
                        ${sortandfilter.order ? 
                        `ORDER BY ${sortandfilter.order}` 
                        : ``}
                        ${sortandfilter.limit ?
                        `LIMIT ${sortandfilter.start ? `${sortandfilter.start}, ` : ``} ${sortandfilter.limit}`
                        : ``}`
        functionGlobal.query(query, res, connection, 'function/master/absence_type/getV3', resolve)
    })
}

type getName = {
    name: string
}
export async function getName({ res, connection }: typeGlobal.functions, { fk_business , v_name, i_code}: { fk_business: number, v_name: string, i_code: number }): Promise<Array<getName>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                            a.v_name AS name
                        FROM dvw_master.vw_absence_type a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            AND a.v_name = '${v_name}'
                            AND a.i_code <> ${i_code}`
        functionGlobal.query(query, res, connection, 'function/master/absence_type/getName', resolve)
    })
}

type insertV3 = ResultSetHeader
export async function insertV3({ res, connection }: typeGlobal.functions, { fk_user_modify, fk_business, v_name, i_start_hour, i_start_minute, i_end_hour, i_end_minute, i_zone }: { fk_user_modify: number, fk_business: number, v_name: string, i_start_hour: number, i_start_minute: number, i_end_hour: number, i_end_minute: number, i_zone: number }): Promise<insertV3> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_master.vw_absence_type
                    SET
                        fk_user_modify = ${fk_user_modify},
                        fk_business = ${fk_business},
                        v_name = '${v_name}',
                        i_start_hour = ${i_start_hour},
                        i_start_minute = ${i_start_minute},
                        i_end_hour = ${i_end_hour},
                        i_end_minute = ${i_end_minute},
                        i_zone = ${i_zone}
                    `
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/insertV3', resolve)
    })
}

type updateV3 = ResultSetHeader
export async function updateV3({ res, connection }: typeGlobal.functions, { fk_user_modify, fk_business, v_name, i_start_hour, i_start_minute, i_end_hour, i_end_minute, i_zone, i_code}: { fk_user_modify: number, fk_business: number, v_name: string, i_start_hour: number, i_start_minute: number, i_end_hour: number, i_end_minute: number, i_zone: number, i_code: number }): Promise<updateV3> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_absence_type SET
                                fk_user_modify = ${fk_user_modify},
                                v_name = '${v_name}',
                                i_start_hour = ${i_start_hour},
                                i_start_minute = ${i_start_minute},
                                i_end_hour = ${i_end_hour},
                                i_end_minute = ${i_end_minute},
                                i_zone = ${i_zone}
                            WHERE i_code = ${i_code}
                            AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/updateV3', resolve)
    })
}

type removeV3 = ResultSetHeader
export async function softDelete({ res, connection }: typeGlobal.functions, { fk_user_modify, fk_business , i_code}: { fk_user_modify: number, fk_business: number, i_code: number }): Promise<removeV3> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE 
                        dvw_master.vw_absence_type 
                    SET
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE i_code = ${i_code}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/removeV3', resolve)
    })
}
