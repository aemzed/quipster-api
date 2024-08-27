import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function insert({res, connection}: typeGlobal.functions, {offlinecode, machinetype}: {offlinecode: string, machinetype: string}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_laundry.vw_transactionrun(s_offlinecode, v_machinetype)
                    VALUES ('${offlinecode}', '${machinetype}')`

        functionGlobal.query(query, res, connection, 'function/transactionrun/insert', resolve)
    })
}