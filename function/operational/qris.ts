import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type getQR = {
    qris: string
}
export async function getQR({res, connection}: typeGlobal.functions, {fk_business, external_id}: {fk_business: number, external_id: string}): Promise<getQR> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        v_qr AS "qris"
                    FROM dvw_operational.vw_qris
                    WHERE fk_business = '${fk_business}'
                        AND external_id = ${external_id}`
        functionGlobal.querySingle(query, res, connection, 'function/operational/qris/getQR', resolve)
    })
}