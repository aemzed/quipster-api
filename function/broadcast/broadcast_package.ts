import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global'
import * as type from '../../type/broadcast_package'

export type getTransaction = {
    date: string,
    customer_name: string,
    phone_number: string,
    type: string,
    refferal: string,
}
export function getTransaction({connection, res}:typeGlobal.functions & typeGlobal.functionsGetDefault, {date_start, date_end}:{date_start:string, date_end:string}): Promise<getTransaction> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            a.dt_created AS date, 
                            b.v_name AS customer_name, 
                            a.v_number AS phone_number,
                            CONCAT('Beli Paket ', c.v_name) AS type,
                            b.v_referral AS refferal
                        FROM tkd_broadcast.bc_user_package a
                        JOIN tkd_broadcast.bc_user b ON a.fk_user = b.i_code
                        JOIN tkd_broadcast.bc_package c ON a.b_type = c.b_type
                        WHERE DATE(a.dt_created) >= '${date_start}'
                            AND DATE(a.dt_created) <= '${date_end}'
                            AND a.b_status = 1
                        UNION ALL
                        SELECT 
                            a.dt_created AS date, 
                            a.v_name AS customer_name, 
                            a.v_phone AS phone_number,
                            'Register' AS type,
                            a.v_referral AS refferal
                        FROM tkd_broadcast.bc_user a
                        WHERE DATE(a.dt_created) >= '${date_start}'
                            AND DATE(a.dt_created) <= '${date_end}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast_package/getTransaction', resolve);
    })
}

export function get<T extends type.broadcastPackage | type.broadcastPackage[]>({connection, res, code="%"}:  typeGlobal.functions & typeGlobal.functionsGetDefault): Promise<T> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            i_code AS 'code',
                            v_name AS 'name',
                            b_type AS 'type',
                            i_price AS 'price',
                            i_price_recurring AS 'price_reccuring',
                            i_value AS 'value',
                            i_day AS 'day'
                        FROM tkd_broadcast.bc_package a
                        WHERE a.b_status = 1
                            AND a.i_code LIKE '${code}'
                        ORDER BY a.b_type, a.i_value DESC`;

        if(code=="%") functionGlobal.query(query, res, connection, 'function/broadcast_package/get', resolve);
        else functionGlobal.querySingle(query, res, connection, 'function/broadcast_package/get', resolve);
    })
}

export function insert({connection, res, data}:  typeGlobal.functions & {data: type.insert}) {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_package SET 
                            v_name = '${data.name}', 
                            b_type = ${data.type},
                            i_price = ${data.price},
                            i_price_recurring = ${data.price_recurring},
                            i_value = ${data.value},
                            i_day = ${data.day}`;

        functionGlobal.query(query, res, connection, 'function/broadcast_package/insert', resolve);
    })
}


export function update({connection, res, data}:  typeGlobal.functions & {data: type.update}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_package SET 
                            v_name = '${data.name}', 
                            b_type = ${data.type},
                            i_price = ${data.price},
                            i_price_recurring = ${data.price_recurring},
                            i_value = ${data.value},
                            i_day = ${data.day}
                        WHERE i_code = ${data.code}`;

        functionGlobal.query(query, res, connection, 'function/broadcast_package/update', resolve);
    })
}


export function del({connection, res, data}:  typeGlobal.functions & {data: type.del}) {
    return new Promise(function(resolve, reject) {
        let query = ` UPDATE tkd_broadcast.bc_package SET
                            b_status = 0
                            WHERE i_code = ${data.code}`;

        functionGlobal.query(query, res, connection, 'function/broadcast_package/del', resolve);
    })
}