import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

type getReport = {
    listResult: Array<{
        date: string,
        value: number
    }>,
    totalBefore: {
        value: number
    }
}
export async function getReport({res, connection}: typeGlobal.functions, {fk_employee, dt_created}: {fk_employee: number, dt_created: {startdate: string, enddate: string}}): Promise<getReport> {
    return new Promise(async (resolve, reject) => {
        let query = `SELECT 
                        a.dt_created AS 'date',
                        a.i_value AS 'value'
                    FROM dvw_transaction.vw_commision_statement a
                    WHERE
                        a.fk_employee = ${fk_employee}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.startdate}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.enddate}'
                    ORDER BY a.dt_created ASC`
        let listResult:Array<{date: string, value: number}> = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/transaction/commisionstatement/getReport/listResult', resolve))
        query = `SELECT 
                    IFNULL(SUM(a.i_value), 0) AS 'value'
                FROM dvw_transaction.vw_commision_statement a
                WHERE
                    a.fk_employee = ${fk_employee}
                    AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') < '${dt_created.startdate}'
                ORDER BY a.dt_created ASC`
        let totalBefore:{value: number} = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/transaction/commisionstatement/getReport/totalBefore', resolve))
        return resolve({listResult, totalBefore})
    })
}