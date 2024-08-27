import pool from '../config/connect'

import * as typeGlobal from '../type/global'

import * as functionGlobal from '../function/global_function'

export async function setWooblazzConnected({connection, res}: typeGlobal.functions, {v_number, b_connected}: {v_number: string, b_connected: 0 | 1}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE tkd_broadcast.bc_user_number
                    SET b_connected = ${b_connected}
                    WHERE v_number = '${v_number}'    
                    `
        functionGlobal.query(query, res, connection, 'function/wooblazz/setWooblazzConnected', resolve)
    })
}