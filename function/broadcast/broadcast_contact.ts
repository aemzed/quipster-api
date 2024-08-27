import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as broadcast from './broadcast';
import * as typeGlobal from '../../type/global'
import * as type from '../../type/broadcast_contact'
import * as typeBroadcastUser from '../../type/broadcast_user'


export async function get<T extends type.broadcastContact[]>({connection, res, data}:  typeGlobal.functions & {data: type.get}):Promise<T> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            a.v_code AS 'code',
                            a.v_name AS 'name',
                            a.v_wa AS 'phone',
                            a.v_param_1 AS 'param_1',
                            a.v_param_2 AS 'param_2',
                            a.v_param_3 AS 'param_3',
                            a.v_param_4 AS 'param_4',
                            a.v_param_5 AS 'param_5',
                            a.v_param_6 AS 'param_6',
                            a.v_param_7 AS 'param_7',
                            a.v_param_8 AS 'param_8',
                            a.v_param_9 AS 'param_9',
                            a.v_param_10 AS 'param_10',
                            a.dt_created AS 'date_created'
                        FROM tkd_broadcast.bc_contact a
                        WHERE a.fk_list = '${data.list}'
                            AND a.b_status = 1`;

        functionGlobal.query(query, res, connection, 'function/broadcast_contact/get', resolve);
    })
}

export async function insert({connection, res, phone, data}:  typeGlobal.functions & {phone: string, data: type.insert}) {
    var user: typeBroadcastUser.broadcastUser = await broadcast.getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });
    var hash = Date.now().toString(36) + Math.random().toString(36)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_contact SET
                            v_code = '${hash}',
                            fk_user = '${user.code}',
                            fk_list = '${data.list}',
                            v_wa = '${data.wa}',
                            v_name = '${data.name}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast_contact/insert', resolve, {id: hash});
    })
}


export async function update({connection, res, data}:  typeGlobal.functions & {data: type.update}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_contact SET
                            fk_list = '${data.list}',
                            v_wa = '${data.wa}',
                            v_name = '${data.name}'
                        WHERE v_code = '${data.code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast_contact/update', resolve);
    })
}


export async function del({connection, res, data}:  typeGlobal.functions & {data: type.del}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_contact SET
                            b_status = 0
                        WHERE v_code = '${data.code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast_contact/del', resolve);
    })
}


export function updateParam({connection, res, code, index, name}:  typeGlobal.functions & {code:string, name: string, index: number}) {

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_contact SET
                            v_param_`+ index +` = '${name}'
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast_contact/updateParam', resolve);
    })
}


export function deleteParam({connection, res, list, index}:  typeGlobal.functions & {list:string, index: number}) {
    var setUpdate = "";
    for(var i=index; i<10; i++){
        setUpdate += `v_param_`+ i +` = v_param_`+ (i+1) + `,` ;
    }
    setUpdate += `v_param_10 = ''`;

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_contact SET
                            `+ setUpdate +`
                        WHERE fk_list = '${list}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast_contact/updateParam', resolve);
    })
}