import * as typeGlobal from '../../type/global'
import * as typePayment from '../../type/paymentmethod'
import * as functionGlobal from '../global_function'
import { ResultSetHeader } from 'mysql2';

type getPaymentMethodSystem = {
    fkPaymentMethodSystem: number
}
export async function getPaymentMethodSystemCode({ connection, res, code }: typeGlobal.functions & { code: number }): Promise<getPaymentMethodSystem> {
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            system: number
        }
        let query = `SELECT 
                        fk_systempaymentmethod AS "system"
                    FROM dvw_master.vw_paymentmethod a
                    WHERE a.i_code = ${code}`
        let result: queryResult = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, '', resolve))
        resolve(<getPaymentMethodSystem>{
            fkPaymentMethodSystem: result.system
        })
    })
}

type getDuplicatePaymentMethodCode = {
    paymentMethodCode: number
}
export async function getDuplicatePaymentMethodCode({ res, connection }: typeGlobal.functions, { fk_business, code }: { fk_business: number, code: number }): Promise<getDuplicatePaymentMethodCode> {
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            code: number
        }
        let query = `SELECT 
                        c.i_code AS "${code}"
                    FROM dvw_master.vw_paymentmethod b
                    JOIN dvw_master.vw_paymentmethod c ON b.v_name = c.v_name AND c.fk_business = $businessDuplicate
                    WHERE b.i_code = $paymentmethod`
        let result: queryResult = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/paymentmethod/getDuplicatePaymentMethodCode', resolve))
        resolve(<getDuplicatePaymentMethodCode>{
            paymentMethodCode: result.code
        })
    })
}

type getMDR = {
    fee: number
}
export async function getMDR({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<getMDR> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.i_mdr AS 'fee'
                    FROM dvw_master.vw_paymentmethod a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.v_name = 'SUPERSELLING'`
        functionGlobal.querySingle(query, res, connection, 'function/master/paymentmethod/getMDR', resolve)
    })
}

type get = {
    code: number,
    name: string,
    systempaymentmethod: number,
    notes: string,
    mdr: number
}
export async function get({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<get> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                            a.i_code AS code,
                            a.v_name AS name,
                            a.fk_systempaymentmethod AS systempaymentmethod,
                            a.v_notes AS notes,
                            a.i_mdr AS mdr
                        FROM dvw_master.vw_paymentmethod a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                        ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/get', resolve)
    })
}

type getName = {
    name: string
}
export async function getNamePayment({ res, connection }: typeGlobal.functions, { fk_business, name , code}: { fk_business: number, name: string, code:number }): Promise<Array<getName>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                            a.v_name AS name
                        FROM dvw_master.vw_paymentmethod a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            AND a.v_name = '${name}'
                            AND a.i_code <> ${code}`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/getNamePayment', resolve)
    })
}

type insert = ResultSetHeader
export async function insert({ res, connection }: typeGlobal.functions, { fk_business, name, systempaymentmethod, notes, mdr, fk_user_modify }: { fk_business: number, name: string, systempaymentmethod: number, notes: string, mdr: number, fk_user_modify: number }): Promise<insert> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_paymentmethod SET 
                                                    fk_business = ${fk_business}, 
                                                    v_name = '${name}', 
                                                    fk_systempaymentmethod = ${systempaymentmethod}, 
                                                    v_notes = '${notes}', 
                                                    i_mdr = ${mdr},
                                                    fk_user_modify = ${fk_user_modify}`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/insert', resolve)
    })
}

type system = {
    code: number,
    name: string
}
export async function getSystem({ res, connection }: typeGlobal.functions, { }: { }): Promise<system> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS code,
                        a.v_name AS name
                    FROM dvw_system.vw_paymentmethod a
                    WHERE a.b_isactive = 1`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/getSystem', resolve)
    })
}

type update = ResultSetHeader
export async function update({ res, connection }: typeGlobal.functions, { fk_business, name, systempaymentmethod, notes, mdr , code, fk_user_modify}: { fk_business: number, name: string, systempaymentmethod: number, notes: string, mdr: number, code: number, fk_user_modify: number }): Promise<update> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_paymentmethod SET
                                            v_name = '${name}',
                                            fk_systempaymentmethod = ${systempaymentmethod},
                                            v_notes = '${notes}',
                                            i_mdr = ${mdr},
                                            fk_user_modify = ${fk_user_modify}
                                        WHERE i_code = ${code}
                                         AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/update', resolve)
    })
}

type remove = ResultSetHeader
export async function remove({ res, connection }: typeGlobal.functions, { fk_business , code, fk_user_modify}: { fk_business: number, code: number, fk_user_modify: number }): Promise<remove> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_paymentmethod SET
                                            b_isactive = 0,
                                            fk_user_modify = ${fk_user_modify}
                                        WHERE i_code = ${code}
                                         AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/remove', resolve)
    })
}

type getNameNOwner = {
    name: string,
    owner: number
}
export async function getNameNOwner({res, connection}: typeGlobal.functions, {i_code, fk_business}: {i_code: number, fk_business: number}): Promise<getNameNOwner> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name AS \`name\`,
                        b.fk_businessowner AS \`owner\`
                    FROM dvw_master.vw_paymentmethod a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.i_code = ${i_code}
                        AND a.fk_business = ${fk_business}
                        AND a.b_isactive = 1`
        functionGlobal.querySingle(query, res, connection, 'function/master/paymentmethod/getNameNOwner', resolve)
    })
}

type getSimilar = {
    code: number,
    name: string,
    business_name: string,
    business: number
}
export async function getSimilar({res, connection}: typeGlobal.functions, {i_code, fk_business, v_name, vw_business}: {i_code: number, fk_business: number, v_name: string, vw_business: {fk_businessowner: number}}): Promise<Array<getSimilar>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_name AS \`name\`,
                        b.v_name AS \`business_name\`,
                        b.i_code AS \`business\`
                    FROM dvw_master.vw_paymentmethod a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.fk_businessowner = ${vw_business.fk_businessowner}
                        AND a.i_code <> ${i_code}
                        AND a.fk_business <> ${fk_business}
                        AND a.v_name = '${v_name}'
                        AND a.b_isactive = 1
                        AND b.dt_expired > NOW()
                    ORDER BY b.i_code`
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod/getSimilar', resolve)
    })
}

export function getRepprtShiftPaymentMethod({res, connection}: typeGlobal.functions, {fk_business, dt_paid, v_paidby}: {fk_business: number, dt_paid: {date_start: string, date_end: string}, v_paidby: string}) {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        \`name\` AS \`name\`,
                        SUM(\`total\`) AS \`subtotal\`,
                        SUM(\`changes\`) AS \`changes\`,
                        CASE
                            WHEN \`systempaymentmethod\` = 1 THEN SUM(\`total\`) - SUM(\`changes\`)
                            ELSE SUM(\`total\`)
                        END AS \`total\`,
                        \`systempaymentmethod\`
                    FROM
                    (
                        SELECT 
                            c.v_name AS \`name\`,
                            b.fk_paymentmethod AS \`paymentmethod\`,
                            SUM(b.i_paidmoney) AS \`total\`,
                            (a.i_changes) AS \`changes\`,
                            c.fk_systempaymentmethod AS \`systempaymentmethod\`
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_transaction.vw_transactionpayment b ON b.fk_transaction = a.i_code
                        JOIN dvw_master.vw_paymentmethod c ON c.i_code = b.fk_paymentmethod
                        WHERE
                            a.fk_business = ${fk_business}
                            AND a.v_paidby like '${v_paidby}'
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') >= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d %H:%i') <= DATE_FORMAT('${dt_paid.date_start}', '%Y-%m-%d %H:%i')
                            AND a.b_ispaid = 1
                            AND a.b_isactive = 1
                            AND a.b_isvoid = 0
                        GROUP BY b.fk_paymentmethod, a.i_code
                    ) AS temp
                    GROUP BY \`paymentmethod\`
                    ORDER BY \`systempaymentmethod\`;
                    `
        functionGlobal.query(query, res, connection, 'function/master/paymentmethod', resolve)
    })
}