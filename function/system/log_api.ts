import * as functionGlobal from '../global_function'
import * as typeGlobal from "../../type/global"

export async function insert({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_system.vw_log_api(fk_business, v_notes)
                    VALUES (${fk_business}, 'v1/customer/select')`
        functionGlobal.query(query, res, connection, 'function/system/log_api/insert', resolve)
    })
}