import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global'
import * as type from '../../type/preferences'
import { ResultSetHeader } from 'mysql2';

type get = {
    code: number,
    name: string
}
export function get({res, connection}: typeGlobal.functions, {fk_business, code, name}: {fk_business: number, code?: {include?: string, exclude?: string}, name?: string}): Promise<Array<get>> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.i_code AS code,
                            a.v_name AS name
                        FROM dvw_master.vw_preference a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            ${code?.exclude ? 
                            `AND a.i_code <> ${code?.exclude}`
                            : ``}
                            ${code?.include ?
                            `AND a.i_code LIKE ${code?.include}`
                            : ``}
                            ${name ?
                            `AND a.v_name LIKE ${name}`
                            : ``}
                        ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/preferences/get', resolve);

    })
}

type insert = ResultSetHeader
export function insert({res, connection}:  typeGlobal.functions, {fk_business, name, fk_user_modify}: {fk_business: number, name: string, fk_user_modify: number}): Promise<insert> {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO dvw_master.vw_preference SET 
                            v_name = '${name}', 
                            fk_business = ${fk_business},
                            fk_user_modify = ${fk_user_modify}`;

        functionGlobal.query(query, res, connection, 'function/preference/insert', resolve);
    })
}

type update = ResultSetHeader
export function update({res, connection}: typeGlobal.functions, {fk_business, code, name, fk_user_modify}: {fk_business: number, code: number, name: string, fk_user_modify: number}): Promise<update> {
    return new Promise(function(resolve, reject) {
        let query = `UPDATE dvw_master.vw_preference SET
                            v_name = '${name}',
                            fk_user_modify = ${fk_user_modify}
                        WHERE i_code = ${code}
                        AND fk_business = ${fk_business}`;
        functionGlobal.query(query, res, connection, 'function/preference/update', resolve);
    })
}

type remove = ResultSetHeader
export function remove({res, connection}: typeGlobal.functions, {fk_business, code, fk_user_modify}: {fk_business: number, code: number, fk_user_modify: number}): Promise<remove> {
    return new Promise(function(resolve, reject) {
        let query = ` UPDATE dvw_master.vw_preference SET
                            b_isactive = 0,
                            fk_user_modify = ${fk_user_modify}
                        WHERE 
                            i_code = ${code}
                            AND fk_business = ${fk_business}
                            AND b_isactive = 1`;

        functionGlobal.query(query, res, connection, 'function/preference/remove', resolve);
    })
}