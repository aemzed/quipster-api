import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global'
import * as typeCategory from '../../type/category'

export type get = {
    code: number,
    name: string,
    count: number,
    pph: number,
    use_tax: number,
    use_service_charge: number
}
export function get<T extends get | get[]>({connection, res, business, code="%", code_exclude="0", name="%", where_extend = ""}:  typeGlobal.functions & typeGlobal.functionsGetDefault & {business: string}): Promise<T> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.i_code AS code,
                            a.v_name AS name,
                            CASE
                                WHEN b.v_name IS NULL THEN SUM(0)
                                ELSE SUM(1)
                            END AS count,
                            a.d_pph AS pph,
                            b_use_tax AS use_tax,
                            b_use_service_charge AS use_service_charge
                        FROM dvw_master.vw_category a
                        LEFT JOIN dvw_master.vw_item b ON a.i_code = b.fk_category AND b.b_isactive = 1
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${business}
                            AND a.i_code <> ${code_exclude}
                            AND a.i_code LIKE '${code}'
                            AND a.v_name LIKE '${name}'
                            ${where_extend}
                        GROUP BY a.i_code
                        ORDER BY a.v_name`

        if(code=="%") functionGlobal.query(query, res, connection, 'function/category/get', resolve);
        else functionGlobal.querySingle(query, res, connection, 'function/category/get', resolve);

    })
}

type getByName = {
    i_code: number
}
export function getByName({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name: string}): Promise<Array<getByName>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        i_code
                    FROM
                        dvw_master.vw_category
                    WHERE
                        fk_business = ${fk_business}
                        AND v_name = '${v_name}'
                        AND b_isactive = 1
                    `
        functionGlobal.query(query, res, connection, 'function/master/category/getByName', resolve)
    })
}

export type getPriceMember = {
    code: string,
    member: string,
    category_code: number,
    category_name: string,
    type: number,
    value: number
}
export function getPriceMember<T extends getPriceMember[]>({connection, res}: typeGlobal.functions, {category, member} : {category?: string, member?: string}): Promise<T> {
    var whereCategory = "";
    var wherePrice = "";
    if(category) whereCategory = ` AND a.fk_category = ${category}`;
    if(member) wherePrice = ` AND a.v_name = '${member}'`;

    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.v_code AS code,
                            a.v_name AS member,
                            b.i_code AS category_code,
                            b.v_name AS category_name,
                            a.b_type AS type,
                            a.i_value AS value
                        FROM dvw_master.vw_category_price a
                        JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
                        WHERE 1=1
                            ${whereCategory}
                            ${wherePrice}
                        ORDER BY a.v_name`

        functionGlobal.query(query, res, connection, 'function/category/getPriceMember', resolve);

    })
}


export function insert({connection, res, data}:  typeGlobal.functions & {data: {business: string, name: string}}) {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO dvw_master.vw_category SET 
                            v_name = '${data.name}', 
                            fk_business = ${data.business}`;

        functionGlobal.query(query, res, connection, 'function/category/insert', resolve);
    })
}

export function insertV3({connection, res}:  typeGlobal.functions, {fk_user_modify, fk_business, v_name}: {fk_user_modify: number, fk_business: number, v_name: string}) {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO 
                            dvw_master.vw_category 
                        SET 
                            fk_user_modify = ${fk_user_modify},
                            v_name = '${v_name}', 
                            fk_business = ${fk_business}`;
        functionGlobal.query(query, res, connection, 'function/category/insert', resolve);
    })
}


export function insertPriceMember({connection, res}:  typeGlobal.functions, {fk_user_modify, business, category, member, type, value, model=""} : {fk_user_modify: number, business: number, category: number, member: string, type: number, value: number, model?: string}) {
    return new Promise(function(resolve, reject) {
        var query = "";

        if(model == ""){
            query = `   INSERT INTO dvw_master.vw_category_price SET
                            fk_user_modify = ${fk_user_modify},
                            v_code = UUID(),
                            fk_business = ${business},
                            fk_category = ${category}, 
                            v_name = '${member}',
                            b_type = ${type},
                            i_value = ${value}
                        ON DUPLICATE KEY UPDATE
                            b_type = ${type},
                            i_value = ${value}`;
        }
        else if(model == "jvape"){
            query = `   INSERT INTO dvw_master.vw_category_price(fk_user_modify, v_code, fk_business, fk_category, v_name, b_type, i_value)
                        SELECT
                            ${fk_user_modify},
                            UUID(),
                            b.fk_business,
                            b.i_code,
                            '${member}',
                            ${type},
                            ${value}
                        FROM dvw_master.vw_category a
                        JOIN dvw_master.vw_category b ON a.v_name = b.v_name
                        JOIN dvw_setting.vw_other c ON b.fk_business = c.fk_business
                        WHERE a.i_code = ${category}
                            AND c.b_jvape = 1`;
        }
        else if(model == "relx"){
            query = `   INSERT INTO dvw_master.vw_category_price(fk_user_modify, v_code, fk_business, fk_category, v_name, b_type, i_value)
                        SELECT
                            ${fk_user_modify},
                            UUID(),
                            b.fk_business,
                            b.i_code,
                            '${member}',
                            ${type},
                            ${value}
                        FROM dvw_master.vw_category a
                        JOIN dvw_master.vw_category b ON a.v_name = b.v_name
                        JOIN dvw_setting.vw_other c ON b.fk_business = c.fk_business
                        WHERE a.i_code = ${category}
                            AND c.b_relx = 1`;
        }

        functionGlobal.query(query, res, connection, 'function/category/insertPriceMember', resolve);
    })
}


export function update({connection, res, data}:  typeGlobal.functions & {data: typeCategory.update}) {
    return new Promise(function(resolve, reject) {
        let query = `UPDATE dvw_master.vw_category SET
                            v_name = '${data.name}'
                        WHERE i_code = ${data.code}`;

        functionGlobal.query(query, res, connection, 'function/category/update', resolve);
    })
}

export function updateV3({connection, res, data}:  typeGlobal.functions & {data: typeCategory.update}, {fk_user_modify}: {fk_user_modify: number}) {
    return new Promise(function(resolve, reject) {
        let query = `UPDATE 
                        dvw_master.vw_category 
                    SET
                        fk_user_modify = ${fk_user_modify},
                        v_name = '${data.name}'
                    WHERE i_code = ${data.code}`;

        functionGlobal.query(query, res, connection, 'function/category/update', resolve);
    })
}


export function del({connection, res, data}:  typeGlobal.functions & {data: typeCategory.del}) {
    return new Promise(function(resolve, reject) {
        let query = ` UPDATE dvw_master.vw_category SET
                            b_isactive = 0
                            WHERE i_code = ${data.code}`;

        functionGlobal.query(query, res, connection, 'function/category/del', resolve);
    })
}

export function delV3({connection, res, data}:  typeGlobal.functions & {data: typeCategory.del}, {fk_user_modify}: {fk_user_modify: number}) {
    return new Promise(function(resolve, reject) {
        let query = ` UPDATE 
                        dvw_master.vw_category 
                    SET
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE i_code = ${data.code}`;

        functionGlobal.query(query, res, connection, 'function/category/del', resolve);
    })
}


export function delPriceMemberByMember({connection, res}:  typeGlobal.functions, {business, member, model = ""} : {business: string, member: string, model?: string}) {
    return new Promise(async function(resolve, reject) {
        var query = "";
        if(model == ""){
            query = `   DELETE FROM dvw_master.vw_category_price
                        WHERE fk_business = ${business}
                            AND v_name = '${member}'`;
        }
        else if(model == "jvape"){
            query = `   DELETE FROM dvw_master.vw_category_price a
                        JOIN dvw_setting.vw_other b ON a.fk_business = b.fk_business
                        WHERE b.b_jvape = 1
                            AND a.v_name = '${member}'`;
        }
        else if(model == "relx"){
            query = `   DELETE FROM dvw_master.vw_category_price a
                        JOIN dvw_setting.vw_other b ON a.fk_business = b.fk_business
                        WHERE b.b_relx = 1
                            AND a.v_name = '${member}'`;
        }
        await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/category/delPriceMemberByMember', resolve))
    })
}

type getCode = {
    code: number
}
export function getCode({res, connection}: typeGlobal.functions, {fk_business, i_code}: {fk_business: number, i_code: number}): Promise<getCode> {
    return new Promise((resolve, reject) => {
        let query = `SELECT a.i_code AS \`code\`
                    FROM dvw_master.vw_category a
                    JOIN dvw_master.vw_category b ON a.v_name = b.v_name
                    WHERE a.fk_business = ${fk_business}
                        AND b.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/category/getCode', resolve)
    })
}

type getNameBusinessOwner = {
    name: string,
    owner: number
}
export function getNameBusinessOwner({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}): Promise<getNameBusinessOwner> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name AS \`name\`,
                        b.fk_businessowner AS \`owner\`
                    FROM dvw_master.vw_category a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/category/getNameBusinessOwner', resolve)
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
                    FROM dvw_master.vw_category a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.fk_businessowner = '${vw_business.fk_businessowner}'
                        AND a.i_code <> ${i_code}
                        AND a.fk_business <> ${fk_business}
                        AND a.v_name = '${v_name}'
                        AND a.b_isactive = 1
                        AND b.dt_expired > NOW()
                    ORDER BY b.i_code`
        functionGlobal.query(query, res, connection, 'function/master/category/getInOtherBusiness', resolve)
    })
}