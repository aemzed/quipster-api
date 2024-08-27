import * as functionGlobal from '../global_function'
import * as typeGlobal from '../../type/global'

export function setFkUserModify({res, connection}: typeGlobal.functions, tableName: string, {i_code, fk_user_modify}: {i_code: number, fk_user_modify: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE ${tableName} SET fk_user_modify = ${fk_user_modify} WHERE i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'controller/log/setFkUserModify', resolve)
    })
}