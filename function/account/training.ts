import * as typeGlobal from '../../type/global'

import * as functionGlobal from '../global_function'

export function insert({res, connection}: typeGlobal.functions, {fk_business, dt_appointment, v_name, v_business_name, v_phone, v_notes}: {fk_business: number, dt_appointment: string, v_name: string, v_business_name: string, v_phone: string, v_notes: string}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_account.vw_training(fk_business, dt_appointment, v_name, v_business_name, v_phone, v_notes) 
                    VALUES (${fk_business}, '${dt_appointment}', '${v_name}', '${v_business_name}', '${v_phone}', '${v_notes}')`
        functionGlobal.query(query, res, connection, 'function/account/training/insert', resolve)
    })
}