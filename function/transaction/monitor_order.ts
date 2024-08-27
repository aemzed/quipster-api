import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type insertMonitorOrder = {
    insertId: string
}
export async function insertMonitorOrder (
    {res, connection}: typeGlobal.functions,
    {
        code, fk_business, fk_transaction, receipt, 
        customer, guest, dt_created
    }   : {
            code: string, fk_business: number, fk_transaction: number,
            receipt: string, customer: string, guest: string, dt_created: string
        }
    ): Promise<insertMonitorOrder> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_monitor_order(v_code, fk_business, fk_transaction, v_receipt, v_customer, v_guest, dt_created)
                    VALUES ('${code}', ${fk_business}, ${fk_transaction}, '${receipt}', '${customer}', '${guest}', '${dt_created}')`

        functionGlobal.query(query, res, connection, 'function/monitor_order/insertMonitorOrder', resolve)
    })
}