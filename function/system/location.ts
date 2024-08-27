import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global'
import * as typeCategory from '../../type/category'

export function getRecommendation({res, address}: {res: any, address: string}) {
    return new Promise(async function(resolve, reject) {
        var listLocation:any = await functionGlobal.gcp(res,{
            feature: "place/autocomplete",
            query: "input=" + encodeURI(address) + "&components=country:id" + "&radius=100000"
        });

        var predictions = listLocation["predictions"];
        var dataLocation = [];
        for(var i = 0; i < predictions.length; i++){
            var location = predictions[i]['description'];
            dataLocation.push(location);
        }

        resolve(dataLocation);
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