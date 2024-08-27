import * as typeGlobal from '../../type/global'

import * as functionGlobal from '../global_function'

export function getReportSalesComplete({res, connection}: typeGlobal.functions, {s_offlinecode_transaction}: {s_offlinecode_transaction: string}): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM dvw_transaction.vw_return a
                    WHERE a.s_offlinecode_transaction = '${s_offlinecode_transaction}'`
        functionGlobal.query(query, res, connection, 'function/transaction/return/getReportSalesComplete', resolve)
    })
}