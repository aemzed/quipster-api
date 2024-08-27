import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

type getCommision = {
    commisionType: number
    commisionValue: number
}
export async function getCommision({res, connection}: typeGlobal.functions, {code, fk_business} : {code: number, fk_business: number}):Promise<getCommision> {
    return new Promise(async (resolve, reject) => {
        type queryResult = {
            commision_type: number,
            commision_value: number
        }
        let query = `SELECT 
                        b_commision AS "commision_type",
                        i_commision AS "commision_value"
                    FROM dvw_master.vw_employee a
                    WHERE a.i_code = ${code}
                        AND a.fk_business = ${fk_business}`
        let result:queryResult = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/employee/getCommision', resolve))
        resolve(<getCommision>{
            commisionType: result.commision_type,
            commisionValue: result.commision_value
        })
    })
}

type getCode = {
    code: string
}
export function getCodes({res, connection}: typeGlobal.functions, {code, pin}: {code: number, pin: string}):Promise<Array<getCode>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_code AS code
                    FROM dvw_master.vw_employee a
                    WHERE a.b_isactive = 1
                        AND a.i_code = ${code}
                        AND a.v_pin = '${pin}'`
        functionGlobal.query(query, res, connection, 'function/operational/absence/selectAbsences', resolve)
    })
}

type getEmployees = {
    code: number,
    name: string,
    email: string,
    idnumber: string,
    gender: number,
    address: string,
    phone: string,
    pin: string,
    user_code: number
}
export function getEmployees({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<Array<getEmployees>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS "code",
                        a.v_name AS "name",
                        a.v_email AS "email",
                        a.v_idnumber AS "idnumber",
                        a.b_gender AS "gender",
                        a.v_address AS "address",
                        a.v_phone AS "phone",
                        a.v_pin AS "pin",
                        a.fk_user as user_code
                    FROM dvw_master.vw_employee a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.b_isuser = 4
                    ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/master/employee/getEmployee', resolve)
    })
}

export function insert(
    {res, connection}: typeGlobal.functions, 
    {
        fk_business, v_name, v_email, v_idnumber, b_gender, v_address, v_phone, v_pin
    }   : {
            fk_business: number, v_name: string, v_email: string, v_idnumber: string, b_gender: number, v_address: string,
            v_phone: string, v_pin: string
        }
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_employee(fk_business, v_name, v_email, v_idnumber, b_gender, v_address, v_phone, v_pin)
                    VALUES (${fk_business}, '${v_name}', '${v_email}', '${v_idnumber}', ${b_gender}, '${v_address}', '${v_phone}', '${v_pin}')`
        functionGlobal.query(query, res, connection, 'function/master/employee/insert', resolve)
    })
}

export function insertV3(
    {res, connection}: typeGlobal.functions, 
    {
        fk_user_modify, fk_business, v_name, v_email, v_idnumber, b_gender, v_address, v_phone, v_pin
    }   : {
            fk_user_modify: number, fk_business: number, v_name: string, v_email: string, v_idnumber: string, b_gender: number, v_address: string,
            v_phone: string, v_pin: string
        }
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_master.vw_employee
                    SET
                        fk_user_modify = ${fk_user_modify},
                        fk_business = ${fk_business},
                        v_name = '${v_name}',
                        v_email = '${v_email}',
                        v_idnumber = '${v_idnumber}',
                        b_gender = ${b_gender},
                        v_address = '${v_address}',
                        v_phone = '${v_phone}',
                        v_pin = '${v_pin}'
                    `
        functionGlobal.query(query, res, connection, 'function/master/employee/insert', resolve)
    })
}

export function update(
    {res, connection}: typeGlobal.functions,
    {
        name, email, idnumber, gender, address, phone, pin, code
    }   : {   
            name: string, email: string, idnumber: string, gender: number, address: string, phone: string,
            pin: string, code: number
        } 
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = ` UPDATE dvw_master.vw_employee SET
                            v_name = '${name}',
                            v_email = '${email}',
                            v_idnumber = '${idnumber}',
                            b_gender = ${gender},
                            v_address = '${address}',
                            v_phone = '${phone}',
                            v_pin = '${pin}'
                        WHERE i_code = '${code}'`
        functionGlobal.query(query, res, connection, "function/master/employee/update", resolve)
    })
}

export function remove({res, connection}: typeGlobal.functions, {code}: {code: number}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_employee SET
                        b_isactive = 0
                    WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/master/employee/remove', resolve)
    })
}

type getEmployeeName = {
    name: string
}
export function getEmployeeName({res, connection}: typeGlobal.functions, {fk_business, name, code}: {fk_business: number, name: string, code: number}): Promise<Array<getEmployeeName>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_name AS name
                    FROM dvw_master.vw_employee a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.v_name = '${name}'
                        AND a.i_code <> ${code}
                        AND a.b_isuser = 4`
        functionGlobal.query(query, res, connection, 'function/master/employee/getEmployee', resolve)
    })
}

export function updateV3(
    {res, connection}: typeGlobal.functions,
    {
        fk_user_modify, fk_business , name, email, idnumber, gender, address, phone, pin, code
    }   : {   
        fk_user_modify: number, fk_business: number, name: string, email: string, idnumber: string, gender: number, address: string, phone: string,
            pin: string, code: number
        } 
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = ` UPDATE dvw_master.vw_employee SET
                            fk_user_modify = ${fk_user_modify},
                            v_name = '${name}',
                            v_email = '${email}',
                            v_idnumber = '${idnumber}',
                            b_gender = ${gender},
                            v_address = '${address}',
                            v_phone = '${phone}',
                            v_pin = '${pin}'
                        WHERE i_code = ${code}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, "function/master/employee/updateV3", resolve)
    })
}

export function softDelete({res, connection}: typeGlobal.functions, {fk_user_modify, i_code, fk_business}: {fk_user_modify: number, i_code: number, fk_business: number}): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE 
                        dvw_master.vw_employee 
                    SET
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE i_code = ${i_code}
                    AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/employee/removeV3', resolve)
    })
}