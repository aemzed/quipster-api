import * as functionGlobal from '../global_function'
import * as typeGlobal from '../../type/global'

export function COPY_MASTER_ITEM({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: {from: number, to: number}}) {
    return new Promise((resolve, reject) => {
        let query = `CALL dvw_view.COPY_MASTER_ITEM(3109, 3151)`
        functionGlobal.query(query, res, connection, 'function/master/view/COPY_MASTER_ITEM', resolve)
    })
}