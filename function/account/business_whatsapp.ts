import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type getPhones = Array<string>
export async function getPhone({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getPhones>{
    return new Promise(async (resolve, reject) => {
        type queryResult = Array<{
            phone: string
        }>
        let query = `SELECT 
                        a.v_phone AS "phone"
                    FROM dvw_account.vw_business_whatsapp a
                    WHERE a.fk_business = ${fk_business}`
        let result: queryResult = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/account/business_whatsapp/getPhone', resolve))
        resolve(result.map((eachResult) => eachResult.phone))
    })
}