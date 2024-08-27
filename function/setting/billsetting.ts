import * as functionGlobal from '../global_function'
import * as typeGlobal from '../../type/global'

export function updateHeaders({res, connection}: typeGlobal.functions, {fk_business, v_header2, v_header3, v_header4}: {fk_business: number, v_header2: string, v_header3: string, v_header4: string}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_setting.vw_billsetting SET
                        v_header2 = '${v_header2}',
                        v_header3 = '${v_header3}',
                        v_header4 = '${v_header4}'
                    WHERE fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/setting/billsetting/updateHeaders', resolve)
    })
}