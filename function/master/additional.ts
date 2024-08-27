import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global';
import * as type from '../../type/unit';
import { ResultSetHeader } from 'mysql2';

type getAdditionalName = {
    name: string
}

type get = {
    code: string, 
    name: string, 
    price: number, 
    price_net: number
}

export async function getAdditionalName ({res, connection}: typeGlobal.functions, {code, fk_business} : {code: number, fk_business: number}): Promise<getAdditionalName> {
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            name: string,
        }
        let query = `SELECT 
                        a.v_name AS "name"
                    FROM dvw_master.vw_additional a
                    WHERE a.i_code = ${code}
                        AND a.fk_business = ${fk_business}`

        let result: queryResult = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/additional/getAdditionalName', resolve))
        resolve (<getAdditionalName>{
            name: result.name
        })
    })
}

export function get({ res, connection }: typeGlobal.functions, { fk_business, code, name }: { fk_business: number, code?: { include?: string, exclude?: string }, name?: string }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT
                                a.i_code AS code,
                                a.v_name AS name,
                                a.i_price AS price,
                                a.i_pricenet AS price_net
                            FROM dvw_master.vw_additional a
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
        functionGlobal.query(query, res, connection, 'function/additional/get', resolve);
    })
}

type insert = ResultSetHeader
export function insert({ res, connection }: typeGlobal.functions, { fk_user_modify, fk_business, v_name, i_price, i_pricenet, v_notes}: { fk_user_modify: number, fk_business: number, v_name: string, i_price: number , i_pricenet : number, v_notes: string }): Promise<insert> {
    return new Promise(function (resolve, reject) {
        let query = `   INSERT INTO 
                            dvw_master.vw_additional 
                        SET 
                            fk_user_modify = ${fk_user_modify},
                            v_name = '${v_name}', 
                            fk_business = ${fk_business},
                            i_price = ${i_price},
                            i_pricenet = ${i_pricenet},
                            v_notes = '${v_notes}'`;

        functionGlobal.query(query, res, connection, 'function/additional/insert', resolve);
    })
}

export function getAdditionalByName({ res, connection }: typeGlobal.functions, { fk_business, v_name , i_code}: { fk_business: number, v_name: string, i_code: number }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT 
                            a.v_name AS "name"
                        FROM dvw_master.vw_additional a
                        WHERE a.v_name = '${v_name}'
                            AND a.fk_business = ${fk_business}
                            AND a.i_code <> ${i_code}
                            AND a.b_isactive = 1`
        functionGlobal.query(query, res, connection, 'function/additional/getAdditionalByName', resolve);
    })
}

type update = ResultSetHeader
export function update({res, connection}: typeGlobal.functions, {fk_user_modify, i_code, v_name}: {fk_user_modify: number, i_code: number, v_name: string}): Promise<update> {
    return new Promise(function(resolve, reject) {
        let query = `UPDATE 
                        dvw_master.vw_additional 
                    SET 
                        fk_user_modify = ${fk_user_modify},
                        v_name = '${v_name}'
                        WHERE i_code = ${i_code}`;
        functionGlobal.query(query, res, connection, 'function/additional/update', resolve);
    })
}

type softDelete = ResultSetHeader
export function softDelete({res, connection}: typeGlobal.functions, {fk_user_modify, fk_business, i_code}: {fk_user_modify: number, fk_business: number, i_code: number}): Promise<softDelete> {
    return new Promise(function(resolve, reject) {
        let query = ` UPDATE 
                        dvw_master.vw_additional 
                    SET
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE i_code = ${i_code}
                        AND fk_business = ${fk_business}
                        AND b_isactive = 1`;

        functionGlobal.query(query, res, connection, 'function/additional/softDelete', resolve);
    })
}

type updatePriceNet = ResultSetHeader
export function updatePriceNet({res, connection}: typeGlobal.functions, {fk_user_modify, i_code, i_pricenet}: {fk_user_modify: number, i_code: number, i_pricenet: number}): Promise<updatePriceNet> {
    return new Promise(function(resolve, reject) {
        let query = `UPDATE 
                        dvw_master.vw_additional 
                    SET 
                        fk_user_modify = ${fk_user_modify},
						i_pricenet = ${i_pricenet}
					WHERE i_code = ${i_code}`;
        functionGlobal.query(query, res, connection, 'function/additional/updatePriceNet', resolve);
    })
}

type getTotalNLimit = {
    total: any,
    limit: any
}
export function getTotalNLimit({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getTotalNLimit> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        COUNT(1) AS \`total\`,
                        b.i_limitmaster AS \`limit\`
                    FROM dvw_master.vw_additional a
                    INNER JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/master/additional/getTotalNLimit', resolve)
    })
}

export function getName({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name: string}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_name AS \`name\`
                    FROM dvw_master.vw_additional a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.v_name = '${v_name}'`
        functionGlobal.querySingle(query, res, connection, 'function/master/additional/getName', resolve)
    })
}

type getNameBusinessOwner = {
    name: string,
    owner: number
}
export function getNameBusinessowner({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}): Promise<getNameBusinessOwner> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name AS \`name\`,
                        b.fk_businessowner AS \`owner\`
                    FROM dvw_master.vw_additional a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/additional/getNameBusinessowner', resolve)
    })
}

type getInOtherBusiness = {
    code: number,
    name: string,
    business_name: string,
    business: number
}
export function getInOtherBusiness({res, connection}: typeGlobal.functions, {i_code, fk_business, v_name, vw_business}: {i_code: number, fk_business: number, v_name: string, vw_business: {fk_businessowner: number}}): Promise<Array<getInOtherBusiness>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_name AS \`name\`,
                        b.v_name AS \`business_name\`,
                        b.i_code AS \`business\`
                    FROM dvw_master.vw_additional a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.fk_businessowner = '${vw_business.fk_businessowner}'
                        AND a.i_code <> ${i_code}
                        AND a.fk_business <> ${fk_business}
                        AND a.v_name = '${v_name}'
                        AND a.b_isactive = 1
                        AND b.dt_expired > NOW()
                    ORDER BY b.i_code`
        functionGlobal.query(query, res, connection, 'function/master/additional/getInOtherBusiness', resolve)
    })
}