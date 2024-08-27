import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        code, fk_transaction_detail, fk_monitor_order, fk_item, 
        item_name, notes
    }   : {
            code: string,
            fk_transaction_detail: string,
            fk_monitor_order: string,
            fk_item: number,
            item_name: string,
            notes: string
        }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_monitor_order_detail(v_code, fk_transaction_detail, fk_monitor_order, fk_item, v_item_name, v_notes)
                    VALUES ('${code}', ${fk_transaction_detail}, '${fk_monitor_order}', ${fk_item}, '${item_name}', '${notes}')`
        functionGlobal.query(query, res, connection, 'function/monitor_order_detail/insert', resolve)
    })
}