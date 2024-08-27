import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function insertCommision(
    {res, connection}: typeGlobal.functions,
    {
        code, fk_business, fk_employee, fk_transaction, fk_item, item_name,
        value, dt_created
    }   : {
        code: string, fk_business: number, fk_employee: number,
        fk_transaction: number, fk_item: number, item_name: string,
        value: number, dt_created: string
    }
) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_commision(v_code, fk_business, fk_employee, fk_transaction, fk_item, v_item_name, i_value, dt_created)
                    VALUES ('${code}', ${fk_business}, ${fk_employee}, ${fk_transaction}, ${fk_item}, '${item_name}', ${value}, '${dt_created}')`
        functionGlobal.query(query, res, connection, 'function/commision/insertCommision', resolve)
    })
}

type getReport = {
    code: string,
    receipt: string,
    item_name: string,
    employee_name: string,
    value: number,
    dt_created: string
}
export async function getReport({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {startdate: string, enddate: string}}): Promise<Array<getReport>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_code AS 'code',
                        b.s_offlinecode AS 'receipt',
                        a.v_item_name AS 'item_name',
                        c.v_name AS 'employee_name',
                        a.i_value AS 'value',
                        a.dt_created AS 'date'
                    FROM dvw_transaction.vw_commision a
                    JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                    JOIN dvw_master.vw_employee c ON a.fk_employee = c.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.startdate}'
                        AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.enddate}'
                    ORDER BY a.dt_created ASC;`
        functionGlobal.query(query, res, connection, 'function/transaction/commision/getReport', resolve)
    })
}