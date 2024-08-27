import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global';
import * as type from '../../type/unit';
import { ResultSetHeader } from 'mysql2';

type get = {
    code: number,
    name: string,
    systemunit: number,
    smallest: number,
    smallestName: number,
    conversion: number,
    biggerCtr: number,
    usedByItem: number
}

type getUnit = {
    code: number,
    name: string
}

export function get({ res, connection }: typeGlobal.functions, { fk_business, v_name }: { fk_business: number, v_name?: string }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `   
                    SELECT *
                    FROM (
                        SELECT
                            a.i_code AS \`code\`,
                            a.v_name AS \`name\`,
                            IFNULL(z.i_code, 99) AS \`system\`,
                            a.fk_unit AS \`smallest\`,
                            IFNULL((SELECT b.v_name FROM dvw_master.vw_unit b WHERE b.i_code = a.fk_unit and b.b_isactive = 1), '') AS \`smallest_name\`,
                            a.i_conversion AS \`conversion\`,
                            (SELECT COUNT(1) FROM dvw_master.vw_unit b WHERE b.fk_unit = a.i_code and b.b_isactive = 1) AS \`bigger_count\`,
                            (SELECT COUNT(1) FROM dvw_master.vw_item b WHERE b.fk_unit = a.i_code and b.b_isactive = 1) AS \`used_by_item\`
                        FROM dvw_master.vw_unit a
                        JOIN dvw_system.vw_unit z ON a.fk_systemunit = z.i_code AND z.b_isactive = 1
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            ${v_name ?
                            `AND a.v_name LIKE '${v_name}'`
                            :``}
                    ) \`temp\`
                    `
        functionGlobal.query(query, res, connection, 'function/unit/get', resolve);
    })
}

export function backup_get({ res, connection }: typeGlobal.functions, { fk_business, code, name }: { fk_business: number, code?: { include?: string, exclude?: string }, name?: string }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT
                                i_code AS code,
                                v_name AS name,
                                fk_systemunit AS systemunit,
                                fk_unit AS smallest,
                                IFNULL((SELECT b.v_name FROM vw_unit b WHERE b.i_code = a.fk_unit and b.b_isactive = 1), '') AS smallestName,
                                i_conversion AS conversion,
                                (SELECT COUNT(1) FROM dvw_master.vw_unit b WHERE b.fk_unit = a.i_code and b.b_isactive = 1) AS biggerCtr,
                                (SELECT COUNT(1) FROM dvw_master.vw_item b WHERE b.fk_unit = a.i_code and b.b_isactive = 1) AS usedByItem
                            FROM dvw_master.vw_unit a
                            WHERE b_isactive = 1
                                AND fk_business = ${fk_business}
                            ${code?.exclude ?
                `AND a.i_code <> ${code?.exclude}`
                : ``}
                            ${code?.include ?
                `AND a.i_code LIKE ${code?.include}`
                : ``}
                            ${name ?
                `AND a.v_name LIKE ${name}`
                : ``}
                            ORDER BY a.fk_unit, a.v_name`
        functionGlobal.query(query, res, connection, 'function/unit/get', resolve);
    })
}

export function getUnit({ res, connection }: typeGlobal.functions) {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT
                            i_code AS code,
                            v_name AS name
                        FROM dvw_system.vw_unit
                        WHERE b_isactive = 1
                        ORDER BY v_name`
        functionGlobal.query(query, res, connection, 'function/unit/getUnit', resolve);
    })
}

export function getUnitByName({ res, connection }: typeGlobal.functions, { fk_business, v_name }: { fk_business: number, v_name: string }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `   
                    SELECT 
                        a.i_code AS code,
                        a.v_name AS name
                    FROM dvw_master.vw_unit a
                    WHERE a.b_isactive = 1
                        AND a.v_name = '${v_name}'
                        AND a.fk_business = ${fk_business}
                    `
        functionGlobal.query(query, res, connection, 'function/unit/get', resolve);
    })
}

type insert = ResultSetHeader
export function insert({ res, connection }: typeGlobal.functions, { fk_business, name, fk_systemunit, fk_user_modify, fk_unit, i_conversion}: { fk_business: number, name: string, fk_systemunit: number, fk_user_modify: number , fk_unit: number, i_conversion: number}): Promise<insert> {
    return new Promise(function (resolve, reject) {
        let query = `   INSERT INTO 
                            dvw_master.vw_unit
                        SET 
                            v_name = '${name}', 
                            fk_business = ${fk_business},
                            fk_systemunit = ${fk_systemunit},
                            fk_unit = ${fk_unit},
                            i_conversion = ${i_conversion},
                            fk_user_modify = ${fk_user_modify}`;

        functionGlobal.query(query, res, connection, 'function/unit/insert', resolve);
    })
}


type update = ResultSetHeader
export function update({res, connection}: typeGlobal.functions, {fk_business, i_code, name, fk_systemunit, fk_user_modify , fk_unit, i_conversion}: { fk_business: number, name: string, fk_systemunit: number, fk_user_modify: number , fk_unit: number, i_conversion: number, i_code: number}): Promise<update> {
    return new Promise(function(resolve, reject) {
        let query = `UPDATE 
                        dvw_master.vw_unit 
                    SET 
                        v_name = '${name}', 
                        fk_systemunit = ${fk_systemunit},
                        fk_unit = ${fk_unit},
                        i_conversion = ${i_conversion},
                        fk_user_modify = ${fk_user_modify}
                    WHERE i_code = ${i_code}
                        AND fk_business = ${fk_business}
                        AND b_isactive = 1`;
        functionGlobal.query(query, res, connection, 'function/unit/update', resolve);
    })
}

type getCode = {
    code: number
}
export function getCode({res, connection}: typeGlobal.functions, {fk_business, i_code}: {fk_business: number, i_code: number}): Promise<getCode> {
    return new Promise((resolve, reject) => {
        let query = `SELECT a.i_code AS \`code\`
                    FROM dvw_master.vw_unit a
                    JOIN dvw_master.vw_unit b ON a.v_name = b.v_name
                    WHERE a.fk_business = ${fk_business}
                        AND b.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/unit/getCode', resolve)
    })
}

type softDelete = ResultSetHeader
export function softDelete({res, connection}: typeGlobal.functions, {i_code, fk_user_modify}: {i_code: number, fk_user_modify: number}): Promise<softDelete> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_unit SET
                        b_isactive = 0,
                        fk_user_modify = ${fk_user_modify}
                    WHERE i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/master/unit/softDelete', resolve)
    })
}

type getNameNOwner = {
    name: string,
    owner: number
}
export function getNameNOwner({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}):Promise<getNameNOwner> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name AS \`name\`,
                        b.fk_businessowner AS \`owner\`
                    FROM dvw_master.vw_unit a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/unit/getNameNOwner', resolve)
    })
}

type getSimilar = {
    code: number,
    name: string,
    business_name: string,
    business: number
}
export function getSimilar({res, connection}: typeGlobal.functions, {i_code, fk_business, v_name, vw_business}: {i_code: number, fk_business: number, v_name: string, vw_business: {fk_businessowner: number}}): Promise<Array<getSimilar>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_name AS \`name\`,
                        b.v_name AS \`business_name\`,
                        b.i_code AS \`business\`
                    FROM dvw_master.vw_unit a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.fk_businessowner = ${vw_business.fk_businessowner}
                        AND a.i_code <> ${i_code}
                        AND a.fk_business <> ${fk_business}
                        AND a.v_name = '${v_name}'
                        AND a.b_isactive = 1
                        AND b.dt_expired > NOW()
                    ORDER BY b.i_code
                    `
        functionGlobal.query(query, res, connection, 'function/master/unit/getSimilar', resolve)
    })
}