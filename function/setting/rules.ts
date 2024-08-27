import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type getValue = {
    value: string
}
export function getValue ({res,connection}: typeGlobal.functions): Promise<getValue> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.VALUE AS "value"
                    FROM dvw_setting.vw_rules a
                    WHERE a.KEY = 'QRIS'`
        functionGlobal.querySingle(query, res, connection, 'function/setting/rules/getValue', resolve)
    })
}