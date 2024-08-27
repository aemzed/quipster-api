import * as typeGlobal from '../../type/global'
import * as functionGlobal from '../global_function'
import { ResultSetHeader } from 'mysql2';

type get = {
    code: number,
    name: string,
    system: number
}
export async function get({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<get> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS code,
                        a.v_name AS name,
                        a.fk_systemexpense AS system
                    FROM dvw_master.vw_expense a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/expense/get', resolve)
    })
}

type getSystem = {
    code: number,
    name: string
}
export async function getSystem({ res, connection }: typeGlobal.functions, { }): Promise<getSystem> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                            i_code AS code,
                            v_name AS name
                        FROM dvw_system.vw_expense
                        WHERE b_isactive = 1`
        functionGlobal.query(query, res, connection, 'function/master/expense/getSystem', resolve)
    })
}

type getExpense = {
    name: string
}
export async function getExpense({ res, connection }: typeGlobal.functions, { fk_business, name, code }: { fk_business: number, name: string, code: number }): Promise<Array<getExpense>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                            a.v_name AS name
                        FROM dvw_master.vw_expense a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            AND a.v_name = '${name}'
                            AND a.i_code <> ${code}`
        functionGlobal.query(query, res, connection, 'function/master/expense/getExpense', resolve)
    })
}

type insert = ResultSetHeader
export async function insert({ res, connection }: typeGlobal.functions, { fk_business, name, system, fk_user_modify }: { fk_business: number, name: string, system: number, fk_user_modify: number }): Promise<insert> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_expense(fk_business, v_name, fk_systemexpense, fk_user_modify)
                            VALUES (${fk_business}, '${name}', ${system}, ${fk_user_modify})`
        functionGlobal.query(query, res, connection, 'function/master/expense/insert', resolve)
    })
}

type remove = ResultSetHeader
export async function remove({ res, connection }: typeGlobal.functions, { fk_business , code, fk_user_modify }: { fk_business: number, code: number, fk_user_modify: number }): Promise<remove> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_expense SET
                                            b_isactive = 0,
                                            fk_user_modify = ${fk_user_modify}
                                        WHERE i_code = ${code}
                                         AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/expense/remove', resolve)
    })
}

type update = ResultSetHeader
export async function update({ res, connection }: typeGlobal.functions, { fk_business, name, system, code, fk_user_modify }: { fk_business: number, name: string, system: number, code: number, fk_user_modify: number }): Promise<update> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_expense SET
                                            v_name = '${name}',
                                            fk_systemexpense = ${system},
                                            fk_user_modify = ${fk_user_modify}
                                        WHERE i_code = ${code}
                                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/expense/update', resolve)
    })
}

type getNameBusinessOwner = {
    name: string,
    owner: number
}
export function getNameBusinessOwner({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}): Promise<getNameBusinessOwner> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name AS \`name\`,
                        b.fk_businessowner AS \`owner\`
                    FROM dvw_master.vw_expense a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.i_code = ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/master/expense/getNameBusinessOwner', resolve)
    })
}

type getInOtherBusiness = {
    code: number,
    name: string,
    business_name: string,
    business: number
}
export function getInOtherBusiness({res, connection}: typeGlobal.functions, {i_code, fk_business, v_name, vw_business}: {i_code: number, fk_business: number, v_name: string, vw_business: {fk_businessowner: number}}): Promise<Array<getInOtherBusiness>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_name AS \`name\`,
                        b.v_name AS \`business_name\`,
                        b.i_code AS \`business\`
                    FROM dvw_master.vw_expense a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.fk_businessowner = ${vw_business.fk_businessowner}
                        AND a.i_code <> ${i_code}
                        AND a.fk_business <> ${fk_business}
                        AND a.v_name = '${v_name}'
                        AND a.b_isactive = 1
                        AND b.dt_expired > NOW()
                    ORDER BY b.i_code`
        functionGlobal.query(query, res, connection, 'function/master/expense/getInOtherBusiness', resolve)
    })
}

export function removeOperationalExpense({res, connection}: typeGlobal.functions, {code, fk_business}: {code: number, fk_business: number}): Promise<remove> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_expense SET
                            b_isactive = 0,
                            b_isconfirm = 0
                        WHERE i_code = ${code}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/expense/removeOperationalExpense', resolve)
    })
}

export async function updateCashRecapOld({res, connection}: typeGlobal.functions, {fk_cashrecap, fk_business, fk_user, dt_expense}: {fk_cashrecap: number, fk_business: number, fk_user: number, dt_expense: {startdate: string, enddate: string}}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_expense SET
                        fk_cashrecap = ${fk_cashrecap}
                    WHERE fk_business = ${fk_business}
                        AND fk_user = ${fk_user}
                        AND fk_cashrecap = 0
                        AND dt_expense >= '${dt_expense.startdate}'
                        AND dt_expense <= '${dt_expense.enddate}'`
        functionGlobal.query(query, res, connection, 'function/operational/expense/updateCashRecap', resolve)
    })
}